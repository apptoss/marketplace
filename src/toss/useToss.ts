import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useAptosClient } from "@/hooks/useAptosClient"
import { formatAmount, parseAmount } from "@/lib/units"
import { useBalance } from "@/peers/useBalance"
import {
	buildTossTransaction,
	executeTossTransaction,
	handleTossResult,
	invalidateTossBalances,
	type TossTransactionParams,
} from "./transactions"

export interface UseTossProps {
	peerId: string
	asset: {
		symbol: string
		decimals: number
		metadata: string
	}
}

export function useToss({ peerId, asset }: UseTossProps) {
	const aptos = useAptosClient()
	const { account, signTransaction } = useWallet()
	const queryClient = useQueryClient()

	// State management
	const [amount, setAmount] = useState("")
	const [isValid, setIsValid] = useState(true)
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	// Balance queries
	const userAsset = useBalance(asset.metadata, account?.address.toString())
	const userAlpha = useBalance(peerId, account?.address.toString())

	// Computed values
	const stake = parseAmount(amount, asset.decimals)
	const { creditsToUse, assetToUse } = (() => {
		const availableCredits = userAlpha.data || 0n
		const creditsToUse = availableCredits >= stake ? stake : availableCredits
		const assetToUse = stake - creditsToUse
		return { creditsToUse, assetToUse }
	})()

	const isButtonDisabled = isLoading || !isValid || stake === 0n

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

		// Check if we have enough asset for the remaining amount
		if (assetToUse > 0n && (userAsset.data || 0n) < assetToUse) {
			return `Insufficient balance. You have ${formatAmount(userAlpha.data || 0n, asset.decimals)} credits and ${formatAmount(userAsset.data || 0n, asset.decimals)} ${asset.symbol}, but need ${formatAmount(stake, asset.decimals)} total`
		}

		// Check if we have any balance at all
		if (userAlpha.data === 0n && userAsset.data === 0n) {
			return `Insufficient balance. You need credits or ${asset.symbol} to toss.`
		}

		return null
	}

	// Main toss function
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
			const { authenticator: senderAuthenticator } = await signTransaction({
				transactionOrPayload: transaction,
			})

			// Execute transaction
			const result = await executeTossTransaction(
				aptos,
				transaction,
				senderAuthenticator,
			)

			// Handle result and check for transaction-level errors
			if (!result.success) {
				setError(result.error || "Transaction failed. Please try again.")
				return
			}

			// Handle successful result
			handleTossResult(result, asset.symbol, asset.decimals)

			// Invalidate balances after successful transaction
			await invalidateTossBalances(
				queryClient,
				account.address.toString(),
				peerId,
				asset.metadata,
			)
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

		// Balance data
		userAsset,
		userAlpha,

		// Computed values
		stake,
		creditsToUse,
		assetToUse,

		// Event handlers
		handleAmountChange,
		executeToss,
	}
}
