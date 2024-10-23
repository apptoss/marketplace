import { ABI } from "@/aptos/abis/coinflip-abi"
import { aptos } from "@/aptos/client"
import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ConnectWalletDialog } from "@/components/wallet-selector"
import { ORIGIN } from "@/constants"
import { parseApt } from "@/lib/units"
import { APTOS_COIN, UserTransactionResponse } from "@aptos-labs/ts-sdk"
import { useWalletClient } from '@thalalabs/surf/hooks'
import { useState } from "react"

export function FortyTwo() {
  const {connected, client } = useWalletClient()
  const [series, setSeries] = useState(0)
  const [amount, setAmount] = useState<number| string | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function place(outcome: boolean) {
    if (!connected) {
      setIsDialogOpen(true)
      return
    }

    if (!client || !amount) {
      console.error('Cannot place without account')
      return
    }

    const hash = await client.useABI(ABI).place_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, outcome, parseApt(Number(amount))],
    }).then((response) => response.hash).catch((e) => {
      if ((e as string).includes("Transaction not found")) {
        const hashMatch = (e as string).match(/transactions\/by_hash\/(0x[0-9a-fA-F]+)/)
        if (!hashMatch) throw e
        console.warn("(workaround) Transaction not found", hashMatch[1])
        return hashMatch[1]
      }
      throw e
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: hash,
    }).then((tx) => tx as UserTransactionResponse)
    const data = tx.events.find((e) => e.type.endsWith("::coinflip::CoinFlip"))?.data
    console.log("CoinFlip", data)

    // TODO handle cases where data is undefined

    if (data && data.pay_ratio_bps > 0) {
      setSeries(series + 1)
    } else {
      setSeries(0)
    }

    toast({
      variant: "default",
      title: data.pay_ratio_bps > 0 ? "You won!" : "You lost!",
    })
  }

  return (
    <Card className="border-none shadow-none sm:shadow sm:border-solid">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between mx-auto space-x-2">
          <AmountInput amount={amount} onChangeAmount={(am) => setAmount(am)}/>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-row border-t p-4">
        <div className="flex w-full items-center gap-2">
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-xs text-muted-foreground">Series</div>
            <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
              {series.toString()}
            </div>
          </div>
          <Button onClick={() => place(false)}>
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                4
            </div>
          </Button>
          <Separator orientation="vertical" className="mx-2 h-10 w-px" />
          <Button variant="outline" onClick={() => place(true)}>
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                2
            </div>
          </Button>
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-xs text-muted-foreground">Multiplier</div>
            <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
              <span className="text-sm font-normal text-muted-foreground">×</span>
                1.98
            </div>
          </div>
        </div>
      </CardFooter>

      {isDialogOpen &&  (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ConnectWalletDialog close={() => setIsDialogOpen(false)} />
        </Dialog>
      )}
    </Card>
  )
}