import { useQuery } from "@tanstack/react-query"
import { aptos } from "@/core/bearium"

type JsonResponse = {
	current_fungible_asset_balances: {
		amount: string
		asset_type_v2: string
	}[]
}

export function useBalance(
	asset: string,
	owner?: string,
	options?: {
		staleTime?: number
		refetchInterval?: number | false
	},
) {
	return useQuery({
		queryKey: ["balance", owner, asset],
		enabled: !!owner,
		staleTime: options?.staleTime ?? 2000, // 2 seconds default
		refetchInterval: options?.refetchInterval ?? 30000, // 3 seconds default
		queryFn: async () => {
			const response = await aptos.queryIndexer<JsonResponse>({
				query: {
					query: assetQuery,
					variables: {
						owner_address: owner,
						asset,
					},
				},
			})
			if (response.current_fungible_asset_balances.length === 0) {
				return 0n
			}
			return BigInt(response.current_fungible_asset_balances[0].amount)
		},
	})
}

const assetQuery = `
	query Current_fungible_asset_balances($owner_address: String, $asset: String) {
		current_fungible_asset_balances(
			where: { owner_address: { _eq: $owner_address }, asset_type_v2: { _eq: $asset } }
		) {
			amount
			asset_type_v2
		}
	}
`
