import { ABI } from "@/aptos/abis/friend_pool-abi"
import { aptos } from "@/aptos/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ORIGIN } from "@/constants"
import { useBalance } from "@/hooks/use-balance"
import { parseApt } from "@/lib/units"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWalletClient } from "@thalalabs/surf/hooks"
  
export function Redeem() {
  const { credits, pool } = useBalance()
  const available = Math.min(Number(credits), Number(pool))

  const {connected, client } = useWalletClient()
  const onRedeem = async () => {
    if (!connected || !client) {
      console.error('Please connect your wallet')
      return
    }

    const response = await client.useABI(ABI).realize_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, parseApt(available)],
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: response.hash,
    })
    console.log('Redeem transaction', tx)
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Redeem</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Redeem Credits</AlertDialogTitle>
          <AlertDialogDescription>
            You can redeem {available} APT from prize pool ({pool} APT available).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRedeem}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
