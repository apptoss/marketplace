import { Ed25519Account, MoveVector } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { aptos, SessionPackageId } from "@/core/bearium"
import { authenticationFunction } from "./session"
import { useSession } from "./useSession"

export function Agents() {
	const { connected, account, signTransaction } = useWallet()
	const [session, setSession] = useSession()
	const [delegationEnabled, setDelegationEnabled] = useState(false)

	const createSession = async () => {
		if (!account) return
		const agent = Ed25519Account.generate()

		const transaction = await aptos.transaction.build.simple({
			sender: account.address,
			data: {
				function: `${SessionPackageId}::delegation::permit_public_key`,
				functionArguments: [MoveVector.U8(agent.publicKey.toUint8Array())],
			},
		})

		const { authenticator: senderAuthenticator } = await signTransaction({
			transactionOrPayload: transaction,
		})

		const pendingTxn = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator,
		})

		await aptos.waitForTransaction({ transactionHash: pendingTxn.hash })

		setSession(agent)
	}

	const delegate = async () => {
		if (!account) return

		const transaction =
			await aptos.abstraction.enableAccountAbstractionTransaction({
				accountAddress: account.address,
				authenticationFunction,
			})

		const { authenticator: senderAuthenticator } = await signTransaction({
			transactionOrPayload: transaction,
		})
		const pendingTxn = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator,
		})
		await aptos.waitForTransaction({ transactionHash: pendingTxn.hash })
		invalidateDelegation()
	}

	const reset = async () => {
		if (!account) return
		const transaction =
			await aptos.abstraction.disableAccountAbstractionTransaction({
				accountAddress: account.address,
			})

		const { authenticator: senderAuthenticator } = await signTransaction({
			transactionOrPayload: transaction,
		})
		const pendingTxn = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator,
		})
		await aptos.waitForTransaction({ transactionHash: pendingTxn.hash })
		invalidateDelegation()
		setSession(null)
	}

	const invalidateDelegation = useCallback(async () => {
		if (!account) return
		console.log("checking delegation", account.address, authenticationFunction)
		const enabled = await aptos.abstraction.isAccountAbstractionEnabled({
			accountAddress: account.address,
			authenticationFunction,
		})
		setDelegationEnabled(enabled)
	}, [account])

	useEffect(() => {
		if (!account) return
		invalidateDelegation()
	}, [account, invalidateDelegation])

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Agents</CardTitle>
				<CardDescription>
					Delegate permissions to agents for automation
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!connected && <p>No account connected</p>}
				{connected && !delegationEnabled && <p>Delegation not enabled</p>}
				{connected && delegationEnabled && !session && <p>No agent created</p>}
				{session && (
					<p className="font-mono break-all text-sm bg-muted p-2 rounded">
						{session.accountAddress.toString()}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				{!delegationEnabled && (
					<Button
						disabled={!connected || !!session}
						variant="outline"
						className="w-full"
						onClick={delegate}
					>
						Enable Delegation
					</Button>
				)}
				{delegationEnabled && (
					<Button variant="destructive" className="w-full" onClick={reset}>
						Reset Delegation
					</Button>
				)}
				<Button
					disabled={!connected || !delegationEnabled || !!session}
					className="w-full"
					onClick={createSession}
				>
					Create Agent
				</Button>
			</CardFooter>
		</Card>
	)
}
