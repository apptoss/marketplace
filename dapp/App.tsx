import { WalletSelector } from '@/components/wallet-selector'
import { Balance } from './components/balance'
import { CreatePool } from './components/create-pool'
import { FortyTwo } from './games/coinflip/forty_two'
import { Limbo } from './games/limbo/limbo'

function App() {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <WalletSelector />
          <Balance />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
        <Limbo />
      </div>
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
        <FortyTwo />
      </div>
      <div className='px-4'>
        <CreatePool />
      </div>
    </div>
  )
}

export default App
