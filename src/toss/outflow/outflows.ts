import type { UserTransactionResponse } from "@aptos-labs/ts-sdk"
import {
	BASIS_POINTS_DIVISOR,
	MAX_PERCENTAGE_DECIMALS,
	PERCENTAGE_MULTIPLIER,
} from "../constants"
import { findTossEvents } from "../events"
import type { ExtractedOutflows, SankeyDataWithRates } from "../types"

export function extractOutflows(
	transaction: UserTransactionResponse,
): ExtractedOutflows {
	// Find the Toss and Origin events
	const { tossEvent, originEvent } = findTossEvents(transaction)

	if (!tossEvent) {
		throw new Error("Missing Toss event in transaction")
	}

	const tossData = tossEvent
	const originData = originEvent

	// Parse the game result
	const won = tossData.expect === tossData.result
	const charge = BigInt(tossData.charge)
	const credit = BigInt(tossData.credit)
	const stake = charge + credit

	// --- Calculate rates for display ---
	const edge_bps = tossData.edge_bps
	const rates: Record<string, string> = {}

	// edge_bps is basis points, so divide by 100 to get percent
	rates.peer = `${(edge_bps / 100).toFixed(MAX_PERCENTAGE_DECIMALS)}%`

	// Handle marketplace fees if Origin event exists
	if (originData) {
		const gross_reward = BigInt(originData.gross_reward)
		const marketplace_fee = BigInt(originData.marketplace_fee)
		const referral_commission = BigInt(originData.referral_commission)
		const skin_commission = BigInt(originData.skin_commission)

		if (gross_reward > 0n) {
			// Only add rates for non-zero fees
			if (marketplace_fee > 0n) {
				rates.marketplace = `${((Number(marketplace_fee) / Number(gross_reward)) * PERCENTAGE_MULTIPLIER).toFixed(MAX_PERCENTAGE_DECIMALS)}%`
			}
			if (referral_commission > 0n) {
				rates.inviter = `${((Number(referral_commission) / Number(gross_reward)) * PERCENTAGE_MULTIPLIER).toFixed(MAX_PERCENTAGE_DECIMALS)}%`
			}
			if (skin_commission > 0n) {
				rates.skin_builder = `${((Number(skin_commission) / Number(gross_reward)) * PERCENTAGE_MULTIPLIER).toFixed(MAX_PERCENTAGE_DECIMALS)}%`
			}
		}
	}

	if (!won) {
		// Loss case: both charge and credit are transferred to peer
		// No fees are paid in loss cases
		return {
			outflows: [
				{
					source: "charge_stake",
					type: "charge",
					amount: charge.toString(),
					destination: "peer",
					flow_type: "real_asset",
				},
				{
					source: "credit_stake",
					type: "credit",
					amount: credit.toString(),
					destination: "peer",
					flow_type: "credit",
				},
			],
			rates: {}, // No rates in loss cases since no fees are paid
		}
	}

	// Win case: complex disbursement flow
	if (!originData) {
		// Simple win case without marketplace fees
		const totalPayout = BigInt(tossData.profit) + stake
		const creditReward = totalPayout - stake
		const riskFee =
			(BigInt(tossData.edge_bps) * totalPayout) / BASIS_POINTS_DIVISOR

		return {
			outflows: [
				{
					source: "charge_stake",
					type: "charge_returned",
					amount: charge.toString(),
					destination: "player",
					flow_type: "real_asset",
				},
				{
					source: "credit_stake",
					type: "credit_returned",
					amount: credit.toString(),
					destination: "player",
					flow_type: "credit",
				},
				{
					source: "credit_reward",
					type: "risk_fee",
					amount: riskFee.toString(),
					destination: "peer",
					flow_type: "credit",
				},
				{
					source: "credit_reward",
					type: "profit",
					amount: (creditReward - riskFee).toString(),
					destination: "player",
					flow_type: "credit",
				},
			],
			rates,
		}
	}

	// Complex win case with marketplace fees
	const totalPayout = BigInt(originData.gross_reward)
	const creditReward = totalPayout - stake
	const riskFee =
		(BigInt(tossData.edge_bps) * totalPayout) / BASIS_POINTS_DIVISOR
	const marketplaceFee = BigInt(originData.marketplace_fee)
	const referralCommission = BigInt(originData.referral_commission)
	const skinCommission = BigInt(originData.skin_commission)

	// Calculate profit (remaining after all fees)
	const totalFees =
		riskFee + marketplaceFee + referralCommission + skinCommission
	const profit = creditReward - totalFees

	return {
		outflows: [
			{
				source: "charge_stake",
				type: "charge_returned",
				amount: charge.toString(),
				destination: "player",
				flow_type: "real_asset",
			},
			{
				source: "credit_stake",
				type: "credit_returned",
				amount: credit.toString(),
				destination: "player",
				flow_type: "credit",
			},
			{
				source: "credit_reward",
				type: "risk_fee",
				amount: riskFee.toString(),
				destination: "peer",
				flow_type: "credit",
			},
			{
				source: "credit_reward",
				type: "marketplace_fee",
				amount: marketplaceFee.toString(),
				destination: "marketplace",
				flow_type: "credit",
			},
			{
				source: "credit_reward",
				type: "referral_commission",
				amount: referralCommission.toString(),
				destination: "inviter",
				flow_type: "credit",
			},
			{
				source: "credit_reward",
				type: "skin_commission",
				amount: skinCommission.toString(),
				destination: "skin_builder",
				flow_type: "credit",
			},
			{
				source: "credit_reward",
				type: "profit",
				amount: profit.toString(),
				destination: "player",
				flow_type: "credit",
			},
		],
		rates,
	}
}

export function convertOutflowsToSankeyData(
	extractResult: ExtractedOutflows,
	feesOnly: boolean = false,
): SankeyDataWithRates {
	const { outflows, rates } = extractResult
	// Filter outflows if fees-only mode is enabled
	let filteredOutflows = feesOnly
		? outflows.filter(
				(outflow) =>
					outflow.type !== "charge_returned" &&
					outflow.type !== "credit_returned" &&
					outflow.type !== "charge" &&
					outflow.type !== "credit" &&
					outflow.type !== "profit",
			)
		: outflows

	// Filter out zero-value outflows to prevent chart issues
	filteredOutflows = filteredOutflows.filter(
		(outflow) => Number(outflow.amount) > 0,
	)

	// Collect unique node names
	const nodeNames = new Set<string>()

	// Add source nodes based on what's actually in the filtered outflows
	const sourcesInOutflows = new Set(
		filteredOutflows.map((outflow) => outflow.source),
	)

	// Only add sources that actually exist in the filtered outflows
	sourcesInOutflows.forEach((source) => {
		nodeNames.add(source)
	})

	filteredOutflows.forEach((outflow) => {
		nodeNames.add(outflow.destination)
	})

	const nodes = Array.from(nodeNames).map((name) => ({
		name,
		rate: rates[name],
	}))
	const nodeMap = new Map(nodes.map((node, index) => [node.name, index]))

	const links = filteredOutflows.map((outflow) => {
		const sourceIndex = nodeMap.get(outflow.source)
		const targetIndex = nodeMap.get(outflow.destination)

		if (sourceIndex === undefined || targetIndex === undefined) {
			throw new Error(
				`Invalid node mapping for outflow: ${outflow.source} -> ${outflow.destination}`,
			)
		}

		return {
			source: sourceIndex,
			target: targetIndex,
			value: Number(outflow.amount), // Keep raw amounts
		}
	})

	return { nodes, links, rates }
}
