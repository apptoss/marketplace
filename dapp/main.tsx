import { TailwindIndicator } from "@/components/tailwind-indicator.tsx"
import { Toaster } from "@/components/ui/toaster.tsx"
import { WalletProvider } from '@/components/wallet-provider.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
      <TailwindIndicator />
      <Toaster />
    </WalletProvider>
  </React.StrictMode>,
)
