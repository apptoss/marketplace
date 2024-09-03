import { TailwindIndicator } from "@/components/tailwind-indicator.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"
import { WalletProvider } from '@/components/wallet-provider.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WalletProvider>
        <App />
        <TailwindIndicator />
        <Toaster />
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
