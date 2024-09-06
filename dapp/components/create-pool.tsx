import { ABI } from "@/aptos/abis/friend_pool-abi"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { createEntryPayload } from "@thalalabs/surf"
import { Button } from "./ui/button"

export function CreatePool() {
  const { account, signAndSubmitTransaction } = useWallet()
  
  async function handleClick() {
    if (!account) {
      console.error('Cannot create pool without account')
      return
    }

    const entryPayload = createEntryPayload(ABI, {
      function: 'create_pool_coin',
      typeArguments: [APTOS_COIN],
      functionArguments: [],
    })

    const response = await signAndSubmitTransaction(
      {
        data: entryPayload,
      }
    )

    console.log('create pool response', response)
  }
  
  return (
    <Button onClick={handleClick}>Create Pool</Button>
  )
}