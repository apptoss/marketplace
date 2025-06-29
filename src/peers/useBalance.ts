import { useQuery } from "@tanstack/react-query"
import { useAptosClient } from "@/hooks/useAptosClient"

type JsonResponse = {
	current_fungible_asset_balances: {
		amount: string
		asset_type_v2: string
	}[]
}

export function useBalance(asset: string, owner?: string) {
	const aptos = useAptosClient()

	return useQuery({
		queryKey: ["balance", owner, asset],
		enabled: !!owner,
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
