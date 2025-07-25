import type { QueryClient } from "@tanstack/react-query"
import { aptos } from "@/core/bearium"

type JsonResponse = {
	current_fungible_asset_balances: {
		amount: string
		asset_type_v2: string
		owner_address: string
	}[]
}

// Extract the core logic into a reusable function
export async function fetchAndCacheManyBalances(
	queryClient: QueryClient,
	assets: string[],
	owners: string[],
) {
	const response = await aptos.queryIndexer<JsonResponse>({
		query: {
			query: manyBalancesQuery,
			variables: {
				owners,
				assets,
			},
		},
	})

	// Create a map for easy lookup: owner -> asset -> balance
	const balanceMap = new Map<string, Map<string, bigint>>()

	// Initialize the map with 0n for all owner-asset combinations
	owners.forEach((owner) => {
		const ownerMap = new Map<string, bigint>()
		assets.forEach((asset) => {
			ownerMap.set(asset, 0n)
		})
		balanceMap.set(owner, ownerMap)
	})

	// Process the response and update the map
	response.current_fungible_asset_balances.forEach((balance) => {
		const amount = BigInt(balance.amount)
		const owner = balance.owner_address
		const asset = balance.asset_type_v2

		const ownerMap = balanceMap.get(owner)
		if (ownerMap) {
			ownerMap.set(asset, amount)
		}
	})

	// Update individual useBalance caches for each owner-asset pair
	owners.forEach((owner) => {
		assets.forEach((asset) => {
			const balance = balanceMap.get(owner)?.get(asset) || 0n
			queryClient.setQueryData(["balance", owner, asset], balance)
		})
	})

	return balanceMap
}

const manyBalancesQuery = `
	query Current_fungible_asset_balances($owners: [String!], $assets: [String!]) {
		current_fungible_asset_balances(
			where: { owner_address: { _in: $owners }, asset_type_v2: { _in: $assets } }
		) {
			amount
			asset_type_v2
			owner_address
		}
	}
`
