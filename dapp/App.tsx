import { WalletSelector } from '@/components/wallet-selector'
import { Balance } from './components/balance'
import { FortyTwo } from './games/coinflip/forty_two'

function App() {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <WalletSelector />
          <Balance />
        </div>
      </div>
      <div>
        <FortyTwo />
      </div>
    </div>
  )
}

export default App
