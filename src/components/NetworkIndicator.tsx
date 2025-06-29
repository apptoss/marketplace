import { Network } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { getAptosNetwork } from "@/core/bearium"

export function NetworkIndicator() {
	const appNetwork = getAptosNetwork()
	const { connected, network } = useWallet()

	const same = (lhs: Network, rhs: Network) => {
		if (lhs === rhs) return true
		if (lhs === Network.LOCAL && rhs === Network.CUSTOM) return true
		return false
	}

	const mismatch = connected && network && !same(appNetwork, network.name)

	const networkInfo = {
		label: appNetwork,
		variant: mismatch
			? ("destructive" as const)
			: appNetwork === "mainnet"
				? ("default" as const)
				: ("secondary" as const),
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge
					variant={networkInfo.variant}
					className="font-mono flex items-center gap-1"
				>
					{mismatch && <AlertTriangle className="h-3 w-3" />}
					{networkInfo.label}
				</Badge>
			</TooltipTrigger>
			{mismatch && (
				<TooltipContent side="bottom">
					Connected wallet network ({network?.name}) does not match app network
					({appNetwork})
				</TooltipContent>
			)}
		</Tooltip>
	)
}
