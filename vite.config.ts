import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	return {
		plugins: [
			// Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
			react(),
			tailwindcss(),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		define: {
			__APTOS_NETWORK__: JSON.stringify(env.APTOS_NETWORK),
			__PEERS__: (() => {
				const jsonPath = path.resolve(__dirname, `peers.testnet.json`)
				const data = fs.readFileSync(jsonPath, "utf-8")
				return JSON.stringify(JSON.parse(data))
			})(),
		},
	}
})
