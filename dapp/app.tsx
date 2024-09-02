import { Balance } from '@/components/balance'
import { SiteHeader } from '@/components/site-header'
import { GameTabs } from './components/game-tabs'

function App() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className='mx-auto max-w-[420px] space-y-2'>
          <Balance />
          <GameTabs />
        </div>
      </main>
    </>
  )
}

export default App
