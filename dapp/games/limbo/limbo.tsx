import { aptos } from "@/aptos/client"
import { ABI } from "@/aptos/limbo-abi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "@/components/ui/use-toast"
import { ORIGIN } from "@/constants"
import { APTOS_COIN, UserTransactionResponse } from "@aptos-labs/ts-sdk"
import { useWalletClient } from '@thalalabs/surf/hooks'
import { useState } from "react"

export function Limbo() {
  const {connected, client } = useWalletClient()
  const [crashPoint, setCrashPoint] = useState("0")

  async function place(multiplier: number) {
    if (!connected || !client) {
      console.error('Cannot place without account')
      return
    }

    const response = await client.useABI(ABI).place_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, multiplier * 100, 1000000],
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
    <Card
      className="max-w-xs" x-chunk="charts-01-chunk-4"
    >
      <CardContent className="gap-4 p-4 pb-2">
        <div className="flex items-center justify-between mx-auto space-x-2">
          <Input
            id="amount"
            type="number"
            defaultValue="1"
            disabled
          />
          <div>APT</div>
          <ToggleGroup
            type="single"
            defaultValue="s"
            variant="outline"
            disabled
          >
            <ToggleGroupItem value="s">1</ToggleGroupItem>
            <ToggleGroupItem value="m">10</ToggleGroupItem>
            <ToggleGroupItem value="l">100</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row border-t p-4">
        <div className="flex w-full items-center gap-2">
          <Button onClick={() => place(1.98)}>Bet</Button>
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