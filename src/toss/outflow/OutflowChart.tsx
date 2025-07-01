import { useMemo } from "react"
import { Sankey, Tooltip } from "recharts"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { CHART_COLORS, NODE_LABELS } from "../constants"
import type { SankeyDataWithRates } from "../types"
import { CustomNode } from "./SankeyNode"

interface OutflowChartProps {
	sankeyData: SankeyDataWithRates
	feesOnly: boolean
}

export function OutflowChart({ sankeyData, feesOnly }: OutflowChartProps) {
	const chartConfig = useMemo(() => {
		return sankeyData.nodes.reduce((acc, node, index) => {
			acc[node.name] = {
				label: NODE_LABELS[node.name] ?? node.name,
				color: CHART_COLORS[index % CHART_COLORS.length],
			}
			return acc
		}, {} as ChartConfig)
	}, [sankeyData.nodes])

	// Check if we have valid data for the chart
	const hasValidData =
		sankeyData.nodes.length > 0 && sankeyData.links.length > 0

	if (!hasValidData) {
		return (
			<div className="flex items-center justify-center h-40">
				<span className="text-muted-foreground">
					{feesOnly ? "No fees in this transaction" : "No data available"}
				</span>
			</div>
		)
	}

	return (
		<ChartContainer
			config={chartConfig}
			className="mx-auto aspect-video max-w-4xl w-full max-h-[400px]"
			role="img"
			aria-label="Transaction outflow diagram"
		>
			<Sankey
				data={sankeyData}
				sort={false}
				node={(props) => <CustomNode {...props} />}
				nodePadding={30}
				margin={{
					left: 0,
					right: 35,
					top: 0,
					bottom: 10,
				}}
				link={{ stroke: "#77c878" }}
			>
				<Tooltip
					formatter={(value: number) => [value.toLocaleString(), "Amount"]}
					labelFormatter={(label) => `Flow to ${label}`}
				/>
			</Sankey>
		</ChartContainer>
	)
}
