import { useQuery } from "@tanstack/react-query"
import { useAptosClient } from "@/hooks/useAptosClient"

export function useTransaction(transactionHash: string) {
	const aptos = useAptosClient()

	return useQuery({
		queryKey: ["transaction", transactionHash],
		queryFn: () => aptos.getTransactionByHash({ transactionHash }),
		staleTime: Infinity, // Transactions never become stale since they're immutable once finalized
		gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for recent access
	})
}
