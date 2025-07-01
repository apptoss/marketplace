import { TransactionResponseType } from "@aptos-labs/ts-sdk"
import { useMemo, useState } from "react"
import { transactionHashSchema } from "@/lib/validation"
import { findTossEvent, hasTossEvent } from "../events"
import { useTransaction } from "../useTransaction"
import { OutflowChart } from "./OutflowChart"
import { OutflowError } from "./OutflowError"
import { OutflowLoading } from "./OutflowLoading"
import { convertOutflowsToSankeyData, extractOutflows } from "./outflows"

export function OutflowSankey({
	transactionHash,
}: {
	transactionHash: string
}) {
	const {
		data: transaction,
		isLoading,
		error,
	} = useTransaction(transactionHash)
	const [feesOnly, setFeesOnly] = useState(false)

	// Memoize the sankey data to prevent unnecessary recalculations
	const sankeyData = useMemo(() => {
		if (
			isLoading ||
			error ||
			!transaction ||
			transaction.type !== TransactionResponseType.User
		) {
			return null
		}

		// Check if transaction has Toss event
		const tossEvent = findTossEvent(transaction)

		if (!tossEvent) {
			return null
		}

		// Extract outflows from real transaction data
		try {
			const extractResult = extractOutflows(transaction)

			// Determine if this is a loss transaction (no fees)
			const isLossTransaction = !extractResult.outflows.some(
				(outflow) =>
					outflow.type === "risk_fee" ||
					outflow.type === "marketplace_fee" ||
					outflow.type === "referral_commission" ||
					outflow.type === "skin_commission",
			)

			// For loss transactions, force feesOnly to false and disable the checkbox
			const effectiveFeesOnly = isLossTransaction ? false : feesOnly

			return {
				data: convertOutflowsToSankeyData(extractResult, effectiveFeesOnly),
				isLossTransaction,
				effectiveFeesOnly,
			}
		} catch (_error) {
			return null
		}
	}, [transaction, feesOnly, isLoading, error])

	// Validate transaction hash input
	const validation = transactionHashSchema.safeParse(transactionHash)
	if (!validation.success) {
		return <OutflowError message="Invalid transaction hash format" />
	}

	// Handle loading state
	if (isLoading) {
		return <OutflowLoading />
	}

	// Handle error state
	if (error) {
		return <OutflowError message="Transaction not found" />
	}

	// Check if transaction exists and is a user transaction
	if (!transaction || transaction.type !== TransactionResponseType.User) {
		return <OutflowError message="Not a Toss transaction" />
	}

	// Check if transaction has Toss event
	if (!hasTossEvent(transaction)) {
		return <OutflowError message="Not a Toss transaction" />
	}

	// Check if we have valid sankey data
	if (!sankeyData) {
		return <OutflowError message="Failed to parse transaction data" />
	}

	return (
		<div className="w-full">
			<div className="flex items-center justify-end mb-4">
				<label
					className={`flex items-center gap-2 ${sankeyData.isLossTransaction ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
				>
					<input
						type="checkbox"
						checked={sankeyData.effectiveFeesOnly}
						onChange={(e) => setFeesOnly(e.target.checked)}
						disabled={sankeyData.isLossTransaction}
						className="w-4 h-4"
					/>
					<span className="text-sm">Fees only</span>
				</label>
			</div>
			<OutflowChart
				sankeyData={sankeyData.data}
				feesOnly={sankeyData.effectiveFeesOnly}
			/>
		</div>
	)
}
