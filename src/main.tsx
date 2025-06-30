import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@/components/theme-provider"
import { getAptosNetwork } from "@/core/bearium"
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

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

// Remote state management
const queryClient = new QueryClient()

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<AptosWalletAdapterProvider
				autoConnect={true}
				dappConfig={{ network: getAptosNetwork() }}
				onError={(error) => {
					console.log("error", error)
				}}
			>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</AptosWalletAdapterProvider>
			<Toaster />
		</ThemeProvider>
	</StrictMode>,
)
