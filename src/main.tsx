import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { Network } from "@aptos-labs/ts-sdk"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletSelector } from "@/components/WalletSelector"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<AptosWalletAdapterProvider
				autoConnect={true}
				dappConfig={{ network: Network.TESTNET }}
				onError={(error) => {
					console.log("error", error)
				}}
			>
				<div className="flex items-center justify-between p-4">
					<h1>A Skin Builder Base</h1>
					<div className="flex items-center gap-2">
						<WalletSelector />
						<ModeToggle />
					</div>
				</div>
			</AptosWalletAdapterProvider>
		</ThemeProvider>
	</StrictMode>,
)
