import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { NetworkIndicator } from "@/components/NetworkIndicator"
import { PeerSelector } from "@/components/PeerSelector"
import { WalletSelector } from "@/components/WalletSelector"
import { peers } from "@/core/peers"
import { PeerCard } from "@/peers/PeerCard"
import { Toss } from "@/toss/Toss"

export const Route = createFileRoute("/")({
	component: RouteComponent,
})

function RouteComponent() {
	const peerIds = Object.keys(peers)
	const [selectedPeerId, setSelectedPeerId] = useState(peerIds[0] || "")

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl mx-auto">
			<div className="flex items-center gap-4">
				<h1 className="text-2xl sm:text-3xl font-bold">A Skin Builder Base</h1>
				<NetworkIndicator />
			</div>
			<div className="flex items-center gap-4">
				<PeerSelector
					selectedPeerId={selectedPeerId}
					onPeerChange={setSelectedPeerId}
				/>
				<div className="flex items-center gap-2">
					<WalletSelector />
					<ModeToggle />
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
				<PeerCard peerId={selectedPeerId} />
				<Toss peerId={selectedPeerId} />
			</div>
		</div>
	)
}
