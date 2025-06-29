/// <reference types="vite/client" />

declare global {
	interface ImportMetaEnv {
		readonly VITE_BEARIUM_PACKAGE_ID: string
		readonly VITE_MARKETPLACE_ID: string
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv
	}
}

// Declare the build-time constants injected by Vite
declare const __APTOS_NETWORK__: string
declare const __PEERS__: Record<
	string,
	{ symbol: string; decimals: number; metadata: string }
>
