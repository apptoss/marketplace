import {
	AccountAddress,
	type AccountAuthenticator,
	type Aptos,
	Hex,
	Serializer,
	type SimpleTransaction,
	type UserTransactionResponse,
} from "@aptos-labs/ts-sdk"
import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MarketplaceId, PackageId } from "@/core/bearium"
import { formatAmount } from "@/lib/units"

export interface TossGameResult {
	result: boolean
	expect: boolean
	face_bps: number
	edge_bps: number
	profit: string
	charge: string
	credit: string
	peer_id: string
	player: string
}

export interface TossTransactionParams {
	peerId: string
	assetToUse: bigint
	creditsToUse: bigint
	outcome: boolean
	senderAddress: string
}

export interface TossExecutionResult {
	success: boolean
	error?: string
	gameResult?: TossGameResult
}

/**
 * Builds a toss transaction with the required parameters
 */
export async function buildTossTransaction(
	aptos: Aptos,
	params: TossTransactionParams,
) {
	const serializer = new Serializer()
	serializer.serialize(AccountAddress.fromString(MarketplaceId))

	// Skin from pull #2
	const skinId = "f1f264a08a4a78599a556a0b8ba79dddc23d8b4e"
	serializer.serializeBytes(Hex.fromHexString(skinId).toUint8Array())

	const extra = serializer.toUint8Array()

	return await aptos.transaction.build.simple({
		sender: params.senderAddress,
		data: {
			function: `${PackageId}::toss::toss`,
			typeArguments: [`${PackageId}::marketplace::Origin`],
			functionArguments: [
				params.peerId,
				params.assetToUse.toString(),
				params.creditsToUse.toString(),
				params.outcome,
				extra,
			],
		},
	})
}

/**
 * Executes a toss transaction and handles the response
 */
export async function executeTossTransaction(
	aptos: Aptos,
	transaction: SimpleTransaction,
	senderAuthenticator: AccountAuthenticator,
): Promise<TossExecutionResult> {
	try {
		const committedTransaction = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator,
		})

		const executedTransaction = await aptos.waitForTransaction({
			transactionHash: committedTransaction.hash,
		})

		console.log("Transaction:", executedTransaction)

		if (executedTransaction.success) {
			const effects = executedTransaction as UserTransactionResponse
			const gameEvent = effects.events.find((e) =>
				e.type.endsWith("::toss::Toss"),
			)?.data as TossGameResult | undefined

			return {
				success: true,
				gameResult: gameEvent,
			}
		} else {
			return {
				success: false,
				error: executedTransaction.vm_status,
			}
		}
	} catch (error) {
		console.error("Transaction execution failed:", error)
		return {
			success: false,
			error: "Transaction failed. Please try again.",
		}
	}
}

/**
 * Handles the toss transaction result and shows appropriate toast notifications
 */
export function handleTossResult(
	result: TossExecutionResult,
	assetSymbol: string,
	assetDecimals: number,
) {
	if (!result.success) {
		toast.error("Transaction failed", {
			description: result.error,
		})
		return
	}

	if (result.gameResult) {
		const {
			result: actualResult,
			expect,
			profit,
			charge,
			credit,
		} = result.gameResult

		const won = expect === actualResult

		const resultMessage = won ? "You won! 🎉" : "You lost 😔"
		const profitFormatted = formatAmount(BigInt(profit), assetDecimals)
		const chargeFormatted = formatAmount(BigInt(charge), assetDecimals)
		const creditFormatted = formatAmount(BigInt(credit), assetDecimals)

		toast.success(resultMessage, {
			description: won
				? `Profit: ${profitFormatted} credits`
				: `Lost: ${chargeFormatted} ${assetSymbol} and ${creditFormatted} credits`,
		})
	} else {
		toast.success("Transaction successful")
	}
}

/**
 * Invalidates balance queries after a successful toss transaction
 */
export async function invalidateTossBalances(
	queryClient: QueryClient,
	userAddress: string,
	peerId: string,
	assetMetadata: string,
) {
	console.log("Starting balance invalidation...")

	try {
		// Wait a moment for blockchain state to propagate
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Invalidate the specific balance queries used by the toss component
		await Promise.all([
			// User's asset balance
			queryClient.invalidateQueries({
				queryKey: ["balance", userAddress, assetMetadata],
			}),
			// User's credits balance for this peer
			queryClient.invalidateQueries({
				queryKey: ["balance", userAddress, peerId],
			}),
			// Peer's asset balance (treasury)
			queryClient.invalidateQueries({
				queryKey: ["balance", peerId, assetMetadata],
			}),
		])

		console.log("Balance invalidation completed successfully")
	} catch (error) {
		console.error("Error during balance invalidation:", error)
	}
}
