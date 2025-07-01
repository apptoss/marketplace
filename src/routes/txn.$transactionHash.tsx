import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { transactionHashParamsSchema } from "@/lib/validation"
import { OutflowSankey } from "@/toss/outflow"

export const Route = createFileRoute("/txn/$transactionHash")({
	parseParams: (params) => transactionHashParamsSchema.parse(params),
	component: TransactionRouteComponent,
})

function TransactionRouteComponent() {
	const { transactionHash } = Route.useParams()
	const navigate = useNavigate()

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl mx-auto">
			<div className="flex items-center gap-4">
				<Button variant="link" size="sm" onClick={() => navigate({ to: "/" })}>
					<ArrowLeft /> Back to Home
				</Button>
			</div>
			<div className="flex items-center gap-4">
				<h1 className="text-2xl sm:text-3xl font-bold">Transaction Details</h1>
			</div>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Hash:</span>
				<code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
					{transactionHash}
				</code>
			</div>
			<div className="w-full">
				<OutflowSankey transactionHash={transactionHash} />
			</div>
		</div>
	)
}
