import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { peers } from "@/core/peers"

interface PeerSelectorProps {
	selectedPeerId: string
	onPeerChange: (peerId: string) => void
}

export function PeerSelector({
	selectedPeerId,
	onPeerChange,
}: PeerSelectorProps) {
	const peerEntries = Object.entries(peers)

	return (
		<Select value={selectedPeerId} onValueChange={onPeerChange}>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder="Choose an asset" />
			</SelectTrigger>
			<SelectContent>
				{peerEntries.map(([peerId, asset]) => (
					<SelectItem key={peerId} value={peerId}>
						{asset.symbol}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
