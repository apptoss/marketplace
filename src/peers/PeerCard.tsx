import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAmount } from "@/lib/units"
import { peers } from "../core/peers"
import { useBalance } from "./useBalance"

interface PeerCardProps {
	peerId: string
}

/**
 * Shared component for displaying a single peer's balance information
 * Can be used standalone or as part of a list
 */
export function PeerCard({ peerId }: PeerCardProps) {
	const asset = peers[peerId]
	const treasury = useBalance(asset.metadata, peerId)

	const { connected, account } = useWallet()
	const userAlpha = useBalance(peerId, account?.address.toString())

	if (treasury.isLoading || userAlpha.isLoading) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Loading...</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Loading balance data...</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<span>
							Peer {peerId.slice(0, 8)}...{peerId.slice(-6)}
						</span>
					</CardTitle>
					<Badge variant="outline">Asset: {asset.symbol}</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Peer's asset holdings - always shown */}
				<div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded">
					<h4 className="font-medium text-sm text-orange-700 dark:text-orange-300">
						Treasury
					</h4>
					<p className="font-mono font-semibold">
						{formatAmount(treasury.data || 0n, asset.decimals)} {asset.symbol}
					</p>
				</div>

				{/* User's balances - only shown when wallet is connected */}
				{connected && (
					<div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
						<h4 className="font-medium text-sm text-green-700 dark:text-green-300">
							Your Credits
						</h4>
						<p className="font-mono font-semibold">
							{formatAmount(userAlpha.data || 0n, asset.decimals)} Credits
						</p>
					</div>
				)}

				{/* Redemption calculation - only shown when wallet is connected */}
				{connected && (
					<div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
						<h4 className="font-medium text-sm mb-2">Redemption Analysis</h4>
						{(() => {
							if (userAlpha.data) {
								const maxRedeemable =
									userAlpha.data > (treasury.data || 0n)
										? treasury.data || 0n
										: userAlpha.data
								const remainingCredits = userAlpha.data - maxRedeemable

								return (
									<div className="space-y-1 text-sm">
										<div className="flex justify-between">
											<span>Max redeemable:</span>
											<span className="font-mono">
												{formatAmount(maxRedeemable, asset.decimals)}{" "}
												{asset.symbol}
											</span>
										</div>
										{remainingCredits > 0 && (
											<div className="flex justify-between text-orange-600 dark:text-orange-400">
												<span>For games only:</span>
												<span className="font-mono">
													{formatAmount(remainingCredits, asset.decimals)}{" "}
													Credits
												</span>
											</div>
										)}
									</div>
								)
							}
							return (
								<p className="text-muted-foreground text-sm">
									No credits to redeem
								</p>
							)
						})()}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
