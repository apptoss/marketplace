import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useSearch } from "@tanstack/react-router"
import { Check, Copy } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { routeTree } from "@/routeTree.gen"
import { useBond } from "./useBond"

export function ReferralBond() {
	const { account } = useWallet()
	const { ref } = useSearch({ from: routeTree.id })
	const [inviterAddress, setInviterAddress] = useState(ref ?? "")
	const { bond, isLoading, error, success, reset } = useBond()
	const [copied, setCopied] = useState(false)
	const inputId = useId()
	const inviteLinkId = useId()

	useEffect(() => {
		if (ref) {
			setInviterAddress(ref)
		}
	}, [ref])

	useEffect(() => {
		if (success) {
			setInviterAddress("")
		}
	}, [success])

	const inviteLink = account
		? `${window.location.origin}?ref=${account.address.toString()}`
		: ""

	const copyToClipboard = async () => {
		if (!inviteLink) return

		try {
			await navigator.clipboard.writeText(inviteLink)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error("Failed to copy to clipboard:", err)
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !isLoading) {
			bond(inviterAddress)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInviterAddress(e.target.value)
		reset()
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Badge variant="secondary">Referral</Badge>
					Join a Referral Network
				</CardTitle>
				<CardDescription>
					Enter your inviter's address to connect and become part of their
					referral network.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label htmlFor={inputId} className="text-sm font-medium">
						Inviter's Address
					</label>
					<Input
						id={inputId}
						type="text"
						placeholder="Enter Aptos address (0x...)"
						value={inviterAddress}
						onChange={handleChange}
						onKeyDown={handleKeyPress}
						disabled={isLoading}
						className="font-mono text-sm"
					/>
				</div>

				{error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{error}
					</div>
				)}

				{success && (
					<div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
						You've successfully joined your inviter's referral network!
					</div>
				)}

				<Button
					onClick={() => bond(inviterAddress)}
					disabled={isLoading || !inviterAddress.trim()}
					className="w-full"
				>
					{isLoading ? "Joining..." : "Join Referral Network"}
				</Button>

				{account && (
					<div className="space-y-2">
						<label
							htmlFor={inviteLinkId}
							className="text-xs font-medium text-muted-foreground"
						>
							Your Personal Invite Link
						</label>
						<div className="flex items-center gap-2">
							<Input
								id={inviteLinkId}
								value={inviteLink}
								readOnly
								className="text-xs font-mono"
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={copyToClipboard}
								className="shrink-0"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
