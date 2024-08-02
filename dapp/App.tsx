import { ABI } from '@/aptos/coinflip-abi'
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import { useEffect, useState } from 'react'
import './App.css'
import { aptos, client } from './aptos/client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    aptos.getLedgerInfo().then(console.log)

    client.useABI(ABI).entry.place({
      functionArguments: [],
      typeArguments: [],
      account: Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey('0x3e6a288ded65f7059033fdad76fb9499507d5e4bac2e703f3bfbc6a8e00a3fff'),
      }),
    }).then((resp) => {
      console.log(resp)
    })
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>dapp/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
