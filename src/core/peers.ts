type Asset = {
	symbol: string
	decimals: number
	metadata: string
}

type PeerMap = Record<string, Asset>

// Peer data is injected at build time by Vite
export const peers: PeerMap = __PEERS__
