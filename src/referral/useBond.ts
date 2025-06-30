import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useCallback, useState } from "react"
import { MarketplaceId, PackageId } from "@/core/bearium"
import { useAptosClient } from "@/hooks/useAptosClient"

export function useBond() {
	const aptos = useAptosClient()
	const { account, signTransaction } = useWallet()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState(false)

	const bond = useCallback(
		async (inviterAddress: string) => {
			if (!account) {
				setError("Please connect your wallet to continue.")
				return
			}

			const trimmedAddress = inviterAddress.trim()
			if (!trimmedAddress) {
				setError("Enter your inviter's address to proceed.")
				return
			}

			try {
				AccountAddress.fromString(trimmedAddress)
			} catch {
				setError("That doesn't look like a valid Aptos address.")
				return
			}

			if (trimmedAddress === account.address.toString()) {
				setError("You can't refer yourself.")
				return
			}

			setIsLoading(true)
			setError("")
			setSuccess(false)

			try {
				const transaction = await aptos.transaction.build.simple({
					sender: account.address,
					data: {
						function: `${PackageId}::marketplace::bond`,
						typeArguments: [`${PackageId}::marketplace::Marketplace`],
						functionArguments: [
							MarketplaceId,
							AccountAddress.fromString(trimmedAddress),
						],
					},
				})

				const { authenticator: senderAuthenticator } = await signTransaction({
					transactionOrPayload: transaction,
				})

				const committedTransaction = await aptos.transaction.submit.simple({
					transaction,
					senderAuthenticator,
				})

				await aptos.waitForTransaction({
					transactionHash: committedTransaction.hash,
				})

				setSuccess(true)
			} catch (err) {
				console.error("Bonding failed:", err)
				setError(
					err instanceof Error
						? err.message
						: "Something went wrong while joining. Please try again.",
				)
			} finally {
				setIsLoading(false)
			}
		},
		[account, aptos, signTransaction],
	)

	const reset = useCallback(() => {
		setError("")
		setSuccess(false)
	}, [])

	return { bond, isLoading, error, success, reset }
}
