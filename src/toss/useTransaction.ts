import { useQuery } from "@tanstack/react-query"
import { aptos } from "@/core/bearium"

export function useTransaction(transactionHash: string) {
	return useQuery({
		queryKey: ["transaction", transactionHash],
		queryFn: () => aptos.getTransactionByHash({ transactionHash }),
		staleTime: Infinity, // Transactions never become stale since they're immutable once finalized
		gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for recent access
	})
}
