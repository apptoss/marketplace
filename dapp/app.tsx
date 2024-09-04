import { Balance } from '@/components/balance'
import { SiteHeader } from '@/components/site-header'
import { GameDrawerSection } from './components/game-drawers'
import { GameTabs } from './components/game-tabs'
import { TopMoverSection } from './components/top-movers'

function App() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className='mx-auto max-w-[420px] space-y-3'>
          <Balance />
          <GameTabs />
          <GameDrawerSection />
          <TopMoverSection />
        </div>
      </main>
    </>
  )
}

export default App
