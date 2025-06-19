import { Network } from "@aptos-labs/ts-sdk"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<AptosWalletAdapterProvider
				autoConnect={true}
				dappConfig={{ network: Network.LOCAL }}
				onError={(error) => {
					console.log("error", error)
				}}
			>
				<RouterProvider router={router} />
			</AptosWalletAdapterProvider>
		</ThemeProvider>
	</StrictMode>,
)
