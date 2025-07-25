import {
	AccountAddress,
	Hex,
	type InputGenerateTransactionPayloadData,
	Serializer,
	type UserTransactionResponse,
} from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import {
	AgencyPackageId,
	aptos,
	MarketplaceId,
	PackageId,
} from "@/core/bearium"
import { formatAmount, parseAmount } from "@/lib/units"
import { fetchAndCacheManyBalances } from "@/peers/batchBalances"
import { useBalance } from "@/peers/useBalance"
import { toSession } from "@/session/session"
import { useSession } from "@/session/useSession"
import { useTransactionWorker } from "@/session/useTransactionWorker"
import { findTossEvent } from "./events"
import {
	buildTossTransaction,
	executeTossTransaction,
	handleTossResult,
} from "./transactions"
import type { TossTransactionParams } from "./types"

export interface UseTossProps {
	peerId: string
	asset: {
		symbol: string
		decimals: number
		metadata: string
	}
	navigate: (options: { to: string }) => void
}

// Interface for optimistic balance updates
interface OptimisticBalanceUpdate {
	transactionHash: string
	assetDeduction: bigint
	creditDeduction: bigint
	timestamp: number
}

function getTransactionErrorMessage(err: unknown): string {
	let errorMessage = "Transaction failed. Please try again."
	if (err instanceof Error) {
		if (err.message.includes("User rejected")) {
			errorMessage = "Transaction was cancelled."
		} else if (err.message.includes("insufficient")) {
			errorMessage = "Insufficient balance to complete the transaction."
		} else if (
			err.message.includes("network") ||
			err.message.includes("connection")
		) {
			errorMessage =
				"Network error. Please check your connection and try again."
		} else if (err.message.includes("timeout")) {
			errorMessage = "Transaction timed out. Please try again."
		}
	}
	return errorMessage
}

export function useToss({ peerId, asset, navigate }: UseTossProps) {
	const { account, signTransaction } = useWallet()
	const queryClient = useQueryClient()

	// Session
	const [session] = useSession()
	const sessionAccount = account && session ? toSession(account, session) : null
	const transactionWorker = useTransactionWorker()

	// Determine if we can use the transaction worker
	const canUseTransactionWorker = session && transactionWorker

	// State management
	const [amount, setAmount] = useState("")
	const [isValid, setIsValid] = useState(true)
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	// Optimistic balance management
	const [optimisticUpdates, setOptimisticUpdates] = useState<
		OptimisticBalanceUpdate[]
	>([])
	const pendingTransactionsRef = useRef<Set<string>>(new Set())
	const refreshInProgressRef = useRef(false)

	// Balance queries with optimized stale time for gaming
	const userAsset = useBalance(asset.metadata, account?.address.toString())
	const userAlpha = useBalance(peerId, account?.address.toString())

	// Manual balance refresh function for post-transaction updates
	const refreshBalances = useCallback(() => {
		// Only refresh if we have valid owners and assets
		if (account?.address && peerId && !refreshInProgressRef.current) {
			refreshInProgressRef.current = true

			const owners = [account.address.toString(), peerId]
			const assets = [asset.metadata, peerId]

			// Use the shared utility function directly - no hook, no stale time issues
			fetchAndCacheManyBalances(queryClient, assets, owners).finally(() => {
				refreshInProgressRef.current = false
			})
		}
	}, [account?.address, peerId, asset.metadata, queryClient])

	// Computed values with optimistic updates applied
	const getOptimisticBalances = useCallback(() => {
		const baseAssetBalance = userAsset.data || 0n
		const baseCreditBalance = userAlpha.data || 0n

		// Calculate total deductions from pending optimistic updates
		const totalAssetDeduction = optimisticUpdates.reduce(
			(sum, update) => sum + update.assetDeduction,
			0n,
		)
		const totalCreditDeduction = optimisticUpdates.reduce(
			(sum, update) => sum + update.creditDeduction,
			0n,
		)

		return {
			assetBalance: baseAssetBalance - totalAssetDeduction,
			creditBalance: baseCreditBalance - totalCreditDeduction,
		}
	}, [userAsset.data, userAlpha.data, optimisticUpdates])

	const { assetBalance, creditBalance } = getOptimisticBalances()

	// Computed values
	const stake = parseAmount(amount, asset.decimals)
	const { creditsToUse, assetToUse } = (() => {
		const availableCredits = creditBalance
		const creditsToUse = availableCredits >= stake ? stake : availableCredits
		const assetToUse = stake - creditsToUse
		return { creditsToUse, assetToUse }
	})()

	const isButtonDisabled = isLoading || !isValid || stake === 0n

	// Optimistic balance management functions
	const addOptimisticUpdate = useCallback(
		(
			transactionHash: string,
			assetDeduction: bigint,
			creditDeduction: bigint,
		) => {
			setOptimisticUpdates((prev) => [
				...prev,
				{
					transactionHash,
					assetDeduction,
					creditDeduction,
					timestamp: Date.now(),
				},
			])
			pendingTransactionsRef.current.add(transactionHash)
		},
		[],
	)

	const removeOptimisticUpdate = useCallback((transactionHash: string) => {
		setOptimisticUpdates((prev) =>
			prev.filter((update) => update.transactionHash !== transactionHash),
		)
		pendingTransactionsRef.current.delete(transactionHash)
	}, [])

	// Event handlers
	const handleAmountChange = (value: string) => {
		setError("") // Clear previous errors

		// The DecimalInput component already handles normalization and validation
		setAmount(value)
		setIsValid(true)
	}

	// Validation helpers
	const validateToss = (): string | null => {
		if (!account) {
			return "Please connect your wallet"
		}

		if (userAlpha.isLoading) {
			return "Wait for your balance to load..."
		}

		if (userAsset.isLoading) {
			return "Wait for your balance to load..."
		}

		if (stake === 0n) {
			return "Please enter a valid amount"
		}

		// Check if we have enough asset for the remaining amount (using optimistic balances)
		if (assetToUse > 0n && assetBalance < assetToUse) {
			return `Insufficient balance. You have ${formatAmount(creditBalance, asset.decimals)} credits and ${formatAmount(assetBalance, asset.decimals)} ${asset.symbol}, but need ${formatAmount(stake, asset.decimals)} total`
		}

		// Check if we have any balance at all (using optimistic balances)
		if (creditBalance === 0n && assetBalance === 0n) {
			return `Insufficient balance. You need credits or ${asset.symbol} to toss.`
		}

		return null
	}

	// Main toss function that chooses the appropriate implementation
	const executeToss = async (outcome: boolean) => {
		// Clear any previous errors at the start
		setError("")

		// Comprehensive validation before starting the transaction
		const validationError = validateToss()
		if (validationError) {
			setError(validationError)
			return
		}

		// This check is now redundant since validateToss already checks for account
		// but keeping it as a safety net with proper error handling
		if (!account) return

		// Start the transaction process
		setIsLoading(true)

		try {
			// Use transaction worker if available, otherwise use traditional flow
			if (canUseTransactionWorker && transactionWorker) {
				// Transaction worker flow
				const serializer = new Serializer()
				serializer.serialize(AccountAddress.fromString(MarketplaceId))
				// Skin from pull #2
				const skinId = "f1f264a08a4a78599a556a0b8ba79dddc23d8b4e"
				serializer.serializeBytes(Hex.fromHexString(skinId).toUint8Array())
				const extra = serializer.toUint8Array()

				const input: InputGenerateTransactionPayloadData = {
					function: `${PackageId}::toss::toss`,
					typeArguments: [`${AgencyPackageId}::marketplace::Origin`],
					functionArguments: [
						peerId,
						assetToUse.toString(),
						creditsToUse.toString(),
						outcome,
						extra,
					],
				}

				const optimisticToss = async () => {
					const uniqueId = crypto.randomUUID()
					addOptimisticUpdate(uniqueId, assetToUse, creditsToUse)
					try {
						const transactionHash = await transactionWorker.push(input)
						const transaction = await aptos.transaction.waitForTransaction({
							transactionHash,
						})
						refreshBalances()

						// Parse Toss event for win/loss
						const gameResult = transaction.success
							? findTossEvent(transaction as UserTransactionResponse)
							: undefined

						const result = {
							success: transaction.success,
							error: transaction.vm_status || undefined,
							gameResult,
							transactionHash: transaction.hash,
						}

						handleTossResult(result, asset.symbol, asset.decimals, navigate)
						return result
					} finally {
						removeOptimisticUpdate(uniqueId)
					}
				}

				toast.promise(optimisticToss(), {
					loading: "Submitting transaction...",
					error: (err) => getTransactionErrorMessage(err),
				})
			} else {
				// Traditional flow
				// Build transaction
				const transactionParams: TossTransactionParams = {
					peerId,
					assetToUse,
					creditsToUse,
					outcome,
					senderAddress: account.address.toString(),
				}

				const transaction = await buildTossTransaction(aptos, transactionParams)

				// Sign transaction
				const senderAuthenticator = await (async () => {
					if (sessionAccount) {
						return aptos.transaction.sign({
							transaction,
							signer: sessionAccount,
						})
					}
					return signTransaction({
						transactionOrPayload: transaction,
					}).then(({ authenticator }) => authenticator)
				})()

				// Execute transaction
				const result = await executeTossTransaction(
					aptos,
					transaction,
					senderAuthenticator,
					queryClient,
				)

				// Handle result and check for transaction-level errors
				if (!result.success) {
					setError(result.error || "Transaction failed. Please try again.")
					return
				}

				// Handle successful result
				handleTossResult(result, asset.symbol, asset.decimals, navigate)

				// Refresh balances after successful transaction
				refreshBalances()
			}
		} catch (err) {
			console.error("Transaction failed:", err)

			// Provide more specific error messages based on error type
			let errorMessage = "Transaction failed. Please try again."

			if (err instanceof Error) {
				// Check for common error patterns and provide better messages
				if (err.message.includes("User rejected")) {
					errorMessage = "Transaction was cancelled."
				} else if (err.message.includes("insufficient")) {
					errorMessage = "Insufficient balance to complete the transaction."
				} else if (
					err.message.includes("network") ||
					err.message.includes("connection")
				) {
					errorMessage =
						"Network error. Please check your connection and try again."
				} else if (err.message.includes("timeout")) {
					errorMessage = "Transaction timed out. Please try again."
				}
			}

			setError(errorMessage)
		} finally {
			// Always ensure loading state is cleared
			setIsLoading(false)
		}
	}

	return {
		// State
		amount,
		isValid,
		error,
		isLoading,
		isButtonDisabled,

		// Balance optimistic values
		userAsset: assetBalance,
		userAlpha: creditBalance,

		// Computed values with optimistic updates applied
		stake,
		creditsToUse,
		assetToUse,

		// Event handlers
		handleAmountChange,
		executeToss,
	}
}
