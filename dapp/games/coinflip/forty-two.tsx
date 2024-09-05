import { aptos } from "@/aptos/client"
import { ABI } from "@/aptos/coinflip-abi"
import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ORIGIN } from "@/constants"
import { parseApt } from "@/lib/units"
import { APTOS_COIN, UserTransactionResponse } from "@aptos-labs/ts-sdk"
import { useWalletClient } from '@thalalabs/surf/hooks'
import { useState } from "react"

export function FortyTwo() {
  const {connected, client } = useWalletClient()
  const [series, setSeries] = useState(0)
  const [amount, setAmount] = useState<number | undefined>(undefined)

  async function place(outcome: boolean) {
    if (!connected || !client || !amount) {
      console.error('Cannot place without account')
      return
    }

    const response = await client.useABI(ABI).place_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, outcome, parseApt(amount)],
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: response.hash,
    }).then((tx) => tx as UserTransactionResponse)
    const data = tx.events.find((e) => e.type.endsWith("::coinflip::CoinFlip"))?.data
    console.log("CoinFlip", data)

    // TODO handle cases where data is undefined

    if (data && data.pay_ratio_bps) {
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
              <span className="text-sm font-normal text-muted-foreground">
                  x
              </span>
                1.98
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}