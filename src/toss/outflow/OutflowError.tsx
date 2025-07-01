interface OutflowErrorProps {
	title?: string
	message: string
}

export function OutflowError({
	title = "Transaction Outflow",
	message,
}: OutflowErrorProps) {
	return (
		<div className="w-full">
			<div className="mb-4">
				<h2 className="text-xl font-semibold">{title}</h2>
			</div>
			<div className="flex items-center justify-center h-40">
				<span className="text-destructive">{message}</span>
			</div>
		</div>
	)
}
