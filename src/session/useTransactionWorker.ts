import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { atom, useAtom } from "jotai"
import { useEffect, useRef } from "react"
import { aptosConfig } from "@/core/bearium"
import { toSession } from "./session"
import { useSession } from "./useSession"
import { NewTransactionWorker } from "./worker"

export const transactionWorkerAtom = atom<NewTransactionWorker | null>(null)

export function useTransactionWorker() {
	const { account } = useWallet()
	const [session] = useSession()
	const [transactionWorker, setTransactionWorker] = useAtom(
		transactionWorkerAtom,
	)

	// Use refs to track previous values for comparison
	const prevAccountRef = useRef(account)
	const prevSessionRef = useRef(session)
	const currentWorkerRef = useRef<NewTransactionWorker | null>(null)

	useEffect(() => {
		// Check if either account or session has changed
		const accountChanged = prevAccountRef.current !== account
		const sessionChanged = prevSessionRef.current !== session

		// Stop previous worker if it exists and either account or session changed
		if (currentWorkerRef.current && (accountChanged || sessionChanged)) {
			try {
				currentWorkerRef.current.stop()
			} catch (error) {
				console.warn("Error stopping transaction worker:", error)
			}
			currentWorkerRef.current = null
			setTransactionWorker(null)
		}

		// Create new worker only when both account and session are available
		if (account && session) {
			const abstractedAccount = toSession(account, session)
			const worker = new NewTransactionWorker({
				aptosConfig,
				account: abstractedAccount,
			})

			// Start the worker
			worker.start().catch((error) => {
				console.error("Error starting transaction worker:", error)
			})

			currentWorkerRef.current = worker
			setTransactionWorker(worker)
		}

		// Update refs with current values
		prevAccountRef.current = account
		prevSessionRef.current = session

		// Cleanup function to stop worker when component unmounts
		return () => {
			if (currentWorkerRef.current) {
				try {
					currentWorkerRef.current.stop()
				} catch (error) {
					console.warn(
						"Error stopping transaction worker during cleanup:",
						error,
					)
				}
			}
		}
	}, [account, session, setTransactionWorker])

	return transactionWorker
}
