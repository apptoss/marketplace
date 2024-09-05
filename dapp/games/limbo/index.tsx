import { aptos } from "@/aptos/client"
import { ABI } from "@/aptos/limbo-abi"
import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ORIGIN } from "@/constants"
import { parseApt } from "@/lib/units"
import { APTOS_COIN, UserTransactionResponse } from "@aptos-labs/ts-sdk"
import { useWalletClient } from '@thalalabs/surf/hooks'
import { useState } from "react"

export function Limbo() {
  const {connected, client } = useWalletClient()
  const [crashPoint, setCrashPoint] = useState("0")
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [targetMultiplier, setTargetMultiplier] = useState<number>(1.98)

  async function place() {
    if (!connected || !client || !amount) {
      console.error('Cannot place without account')
      return
    }

    const response = await client.useABI(ABI).place_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, Math.floor(targetMultiplier * 100), parseApt(amount)],
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: response.hash,
    }).then((tx) => tx as UserTransactionResponse)
    const data = tx.events.find((e) => e.type.endsWith("::limbo::Limbo"))?.data
    console.log("Limbo", data)

    console.log("Limbo crash bps", data.actual_multiplier_pct)
    setCrashPoint((data.actual_multiplier_pct / 100).toFixed(2))

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

      <CardContent>
        <div className="flex flex-row items-center justify-between space-x-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="multiplier">Target Multiplier</Label>
            <Input 
              type="number" 
              id="multiplier" 
              placeholder="1.98" 
              step="0.01" 
              max="1000000" 
              value={targetMultiplier} onChange={(e) => {
                const amount = e.target.valueAsNumber
                setTargetMultiplier(amount)
              }} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-row border-t p-4">
        <div className="flex w-full items-center gap-2">
          <Button onClick={() => place()}>Bet</Button>
          <Separator orientation="vertical" className="mx-2 h-10 w-px" />
          <div className="grid flex-1 auto-rows-min gap-0.5">
            <div className="text-xs text-muted-foreground">Multiplier</div>
            <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
              <span className="text-sm font-normal text-muted-foreground">
                  x
              </span>
              {crashPoint}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}