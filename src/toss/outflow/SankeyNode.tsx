import { CHART_COLORS, NODE_LABELS } from "../constants"

interface CustomNodeProps {
	x: number
	y: number
	width: number
	height: number
	index: number
	payload: { name: string; rate?: string; value: number }
}

export function CustomNode({
	x,
	y,
	width,
	height,
	index,
	payload,
}: CustomNodeProps) {
	// Use predefined chart colors based on index
	const nodeColor = CHART_COLORS[index % CHART_COLORS.length]

	const isSource =
		payload.name === "charge_stake" ||
		payload.name === "credit_stake" ||
		payload.name === "credit_reward"
	const textAnchor = isSource ? "start" : "end"
	const textX = isSource ? x + 15 : x - 4 // Reduced padding for smaller chart

	// Use human readable label if available
	const label = NODE_LABELS[payload.name] ?? payload.name

	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={nodeColor}
				stroke="var(--border)"
				strokeWidth={1}
			/>
			<text
				x={textX}
				y={y + height / 2}
				textAnchor={textAnchor}
				dominantBaseline="middle"
				fill="var(--foreground)"
				fontSize={10}
				fontWeight="bold"
			>
				{label}
			</text>
			{/* If destination and has a rate, show rate to the right of node, left-aligned */}
			{!isSource && payload.rate ? (
				<text
					x={x + width + 4}
					y={y + height / 2}
					textAnchor="start"
					dominantBaseline="middle"
					fill="var(--foreground)"
					fontSize={9}
					fontWeight="bold"
				>
					{payload.rate}
				</text>
			) : null}
		</g>
	)
}
