import { Network } from "@aptos-labs/ts-sdk"

export const PackageId = import.meta.env.VITE_BEARIUM_PACKAGE_ID
export const MarketplaceId = import.meta.env.VITE_MARKETPLACE_ID

export const DefaultSkinId = "b455fccfc4fbb707e7b4245bb51e9afd38ea57eb"

export function getAptosNetwork(): Network {
	const value = __APTOS_NETWORK__.toLowerCase()
	if (!isNetwork(value)) throw new Error(`Unknown network: ${value}`)
	return value as Network
}

function isNetwork(value: string): value is Network {
	return Object.values(Network).includes(value as Network)
}

/**
 * Gets the Aptos explorer URL for a transaction hash based on the current network
 * @param transactionHash The transaction hash to view
 * @returns The full URL to view the transaction on the appropriate explorer
 */
export function getExplorerUrl(transactionHash: string): string {
	const network = getAptosNetwork()
	return `https://explorer.aptoslabs.com/txn/${transactionHash}?network=${network}`
}
