import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<div className="flex items-center justify-between p-4">
				<h1>A Skin Builder Base</h1>
				<ModeToggle />
			</div>
		</ThemeProvider>
	</StrictMode>,
)
