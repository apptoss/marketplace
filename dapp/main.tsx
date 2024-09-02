import { Toaster } from "@/components/ui/toaster.tsx"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import { WalletProvider } from './components/wallet-provider.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
      <Toaster />
    </WalletProvider>
  </React.StrictMode>,
)
