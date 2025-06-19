import { createFileRoute } from "@tanstack/react-router"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletSelector } from "@/components/WalletSelector"

export const Route = createFileRoute("/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex items-center justify-between p-4">
			<h1>A Skin Builder Base</h1>
			<div className="flex items-center gap-2">
				<WalletSelector />
				<ModeToggle />
			</div>
		</div>
	)
}
