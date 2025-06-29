import { Network } from "@aptos-labs/ts-sdk"

export const PackageId = import.meta.env.VITE_BEARIUM_PACKAGE_ID
export const MarketplaceId = import.meta.env.VITE_MARKETPLACE_ID

export function getAptosNetwork(): Network {
	const value = __APTOS_NETWORK__.toLowerCase()
	if (!isNetwork(value)) throw new Error(`Unknown network: ${value}`)
	return value as Network
}

function isNetwork(value: string): value is Network {
	return Object.values(Network).includes(value as Network)
}
