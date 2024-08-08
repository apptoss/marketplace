import { WalletSelector } from '@/components/wallet-selector'

function App() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  )
}

export default App
