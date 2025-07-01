import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { NetworkIndicator } from "@/components/NetworkIndicator"
import { PeerSelector } from "@/components/PeerSelector"
import { WalletSelector } from "@/components/WalletSelector"
import { peers } from "@/core/peers"
import { PeerCard } from "@/peers/PeerCard"
import { ReferralBond } from "@/referral/ReferralBond"
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
				<ReferralBond />
			</div>

			{/* Example transaction links */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Example Transactions</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Link
						to="/txn/$transactionHash"
						params={{
							transactionHash:
								"0x50875aca47b5eaf29d6a12de7acb015aca3681641cd33bb5263e1ef4580d6809",
						}}
						className="block p-4 border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="text-sm font-mono break-all text-muted-foreground">
							0x50875aca47b5eaf29d6a12de7acb015aca3681641cd33bb5263e1ef4580d6809
						</div>
						<div className="text-sm mt-2">View Transaction →</div>
					</Link>
					<Link
						to="/txn/$transactionHash"
						params={{
							transactionHash:
								"0x33238da536ed3e4cd9fdbe0925de0bd4d21ad542190717ed11e8095b5cf04eec",
						}}
						className="block p-4 border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="text-sm font-mono break-all text-muted-foreground">
							0x33238da536ed3e4cd9fdbe0925de0bd4d21ad542190717ed11e8095b5cf04eec
						</div>
						<div className="text-sm mt-2">View Transaction →</div>
					</Link>
					<Link
						to="/txn/$transactionHash"
						params={{
							transactionHash:
								"0x4cbd961d65a1524c00ff6a39fe6d4c22f5a2bd270148b90303ff8f42c634f7c6",
						}}
						className="block p-4 border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="text-sm font-mono break-all text-muted-foreground">
							0x4cbd961d65a1524c00ff6a39fe6d4c22f5a2bd270148b90303ff8f42c634f7c6
						</div>
						<div className="text-sm mt-2">View Transaction →</div>
					</Link>
					<Link
						to="/txn/$transactionHash"
						params={{
							transactionHash:
								"0x73a8e609143cbcb99cbf93069c87317a96f1c76ca0cad719ce7b36baa555e5bb",
						}}
						className="block p-4 border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="text-sm font-mono break-all text-muted-foreground">
							0x73a8e609143cbcb99cbf93069c87317a96f1c76ca0cad719ce7b36baa555e5bb
						</div>
						<div className="text-sm mt-2">View Transaction →</div>
					</Link>
					<Link
						to="/txn/$transactionHash"
						params={{
							transactionHash:
								"0xd2781d78bc98bde2d44bbbc907da7f7a577e6930f90b1267806e9ceef737df07",
						}}
						className="block p-4 border rounded-lg hover:bg-muted transition-colors"
					>
						<div className="text-sm font-mono break-all text-muted-foreground">
							0xd2781d78bc98bde2d44bbbc907da7f7a577e6930f90b1267806e9ceef737df07
						</div>
						<div className="text-sm mt-2">View Transaction →</div>
					</Link>
				</div>
			</div>
		</div>
	)
}
