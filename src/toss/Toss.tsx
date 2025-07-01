import { useNavigate } from "@tanstack/react-router"
import { DecimalInput } from "@/components/DecimalInput"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { peers } from "@/core/peers"
import { formatAmount } from "@/lib/units"
import { useToss } from "./useToss"

interface TossProps {
	peerId: string
}

export function Toss({ peerId }: TossProps) {
	const asset = peers[peerId]
	const navigate = useNavigate()

	const {
		amount,
		isValid,
		error,
		isLoading,
		isButtonDisabled,
		userAsset,
		userAlpha,
		stake,
		creditsToUse,
		assetToUse,
		handleAmountChange,
		executeToss,
	} = useToss({ peerId, asset, navigate })

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Toss</CardTitle>
				<CardDescription>
					Stake credits or {asset.symbol}. Win credits — or lose your stake.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<DecimalInput
							placeholder={`Stake amount in ${asset.symbol}`}
							value={amount}
							onValueChange={handleAmountChange}
							isValid={isValid}
							showError={true}
							disabled={isLoading}
						/>
					</div>

					{/* Balance display */}
					<div className="flex gap-2 text-right">
						<div className="text-sm space-y-1">
							<div>Max</div>
							<div className="text-muted-foreground">Available</div>
							<div className="text-muted-foreground">Credits</div>
						</div>
						<div className="text-sm space-y-1">
							<div>
								<span className="font-mono">
									{formatAmount(
										(userAsset.data || 0n) + (userAlpha.data || 0n),
										asset.decimals,
									)}
								</span>{" "}
								{asset.symbol}
							</div>
							<div className="text-muted-foreground">
								<span className="font-mono">
									{formatAmount(userAsset.data || 0n, asset.decimals)}
								</span>{" "}
								{asset.symbol}
							</div>
							<div className="text-muted-foreground">
								<span className="font-mono">
									{formatAmount(userAlpha.data || 0n, asset.decimals)}
								</span>{" "}
								{asset.symbol}
							</div>
						</div>
					</div>

					{/* Error display */}
					{error && <div className="text-sm text-red-500">{error}</div>}

					{/* Amount preview */}
					{amount && isValid && stake > 0n && (
						<div className="text-sm text-muted-foreground space-y-1">
							<div>
								You will stake:{" "}
								<span className="font-mono">
									{formatAmount(stake, asset.decimals)}
								</span>{" "}
								total
							</div>
							{creditsToUse > 0n && (
								<div className="text-green-600">
									•{" "}
									<span className="font-mono">
										{formatAmount(creditsToUse, asset.decimals)}
									</span>{" "}
									from credits
								</div>
							)}
							{assetToUse > 0n && (
								<div className="text-blue-600">
									•{" "}
									<span className="font-mono">
										{formatAmount(assetToUse, asset.decimals)}
									</span>{" "}
									from {asset.symbol}
								</div>
							)}
						</div>
					)}
				</div>

				<CardFooter className="flex justify-end gap-2">
					<div className="pr-1">Pick</div>
					<Button onClick={() => executeToss(true)} disabled={isButtonDisabled}>
						4
					</Button>
					<Button
						onClick={() => executeToss(false)}
						variant="outline"
						disabled={isButtonDisabled}
					>
						2
					</Button>
					<div className="grid auto-rows-min gap-0.5 pl-1">
						<div className="text-xs text-muted-foreground">Multiplier</div>
						<div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
							<span className="text-sm font-normal text-muted-foreground">
								×
							</span>
							2
						</div>
					</div>
				</CardFooter>
			</CardContent>
		</Card>
	)
}
