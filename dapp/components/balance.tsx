import { ABI } from "@/aptos/abis/friend_pool-abi"
import { aptos } from "@/aptos/client"
import { ORIGIN } from "@/constants"
import { useBalance } from "@/hooks/use-balance"
import { parseApt } from "@/lib/units"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWalletClient } from "@thalalabs/surf/hooks"
import { Button } from "./ui/button"

export function Balance() {
  const { balance, credits } = useBalance()

  const {connected, client } = useWalletClient()
  const onRedeem = async () => {
    if (!connected || !client) {
      console.error('Please connect your wallet')
      return
    }

    const response = await client.useABI(ABI).realize_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, parseApt(Number(credits))],
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: response.hash,
    })
    console.log('Redeem transaction', tx)
  }

  return (
    <div className="w-[350px] mx-auto">
      <div className="text-sm text-muted-foreground">Total Balance (APT)</div>
      <div className="flex justify-between">
        <div className="flex space-x-2 items-baseline">
          <div className="text-4xl font-semibold">{balance}</div>
          <div className="text-sm text-muted-foreground">{credits} credits</div>
        </div>
        <Button variant='ghost' onClick={onRedeem}>Redeem</Button>
      </div>
    </div>
  )
}