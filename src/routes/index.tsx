import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { NetworkIndicator } from "@/components/NetworkIndicator"
import { PeerSelector } from "@/components/PeerSelector"
import { WalletSelector } from "@/components/WalletSelector"
import { peers } from "@/core/peers"
import { PeerCard } from "@/peers/PeerCard"

export const Route = createFileRoute("/")({
	component: RouteComponent,
})

function RouteComponent() {
	const peerIds = Object.keys(peers)
	const [selectedPeerId, setSelectedPeerId] = useState(peerIds[0] || "")

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<div className="flex gap-4">
					<h1>A Skin Builder Base</h1>
					<NetworkIndicator />
				</div>
				<div className="flex items-center gap-2">
					<WalletSelector />
					<ModeToggle />
				</div>
			</div>
			<div className="flex justify-center">
				<PeerSelector
					selectedPeerId={selectedPeerId}
					onPeerChange={setSelectedPeerId}
				/>
			</div>
			<PeerCard peerId={selectedPeerId} />
		</div>
	)
}
