import { ABI } from "@/aptos/abis/dice-abi"
import { aptos } from "@/aptos/client"
import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ConnectWalletDialog } from "@/components/wallet-selector"
import { ORIGIN } from "@/constants"
import DiceSlider from "@/games/dice/dice-slider"
import { parseApt } from "@/lib/units"
import { APTOS_COIN, UserTransactionResponse } from "@aptos-labs/ts-sdk"
import { useWalletClient } from '@thalalabs/surf/hooks'
import { ArrowLeftRight } from "lucide-react"
import { useState } from "react"

const defaultNumber = 50
const defaultPayout = 1.98
const defaultWinChange = defaultNumber

export function Dice() {
  const {connected, client } = useWalletClient()
  const [expectNumber, setExpectNumber] = useState(defaultNumber)
  const [payout, setPayout] = useState(defaultPayout)
  const [winChange, setWinChange] = useState(defaultWinChange)
  const [isRollOver, setIsRollOver] = useState(false)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const rnn = (num: number, decimal: number) => {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal)
  }

  const handleSlideNumber = (range: number[]) => {
    if (!range || range.length === 0) return

    let newNumber = range[0]

    if (newNumber < 2) newNumber = 2
    if (newNumber > 98) newNumber = 98

    setExpectNumber(newNumber)
    setWinChange(newNumber)
    setPayout(rnn((100 / newNumber) * 0.99, 4))
  }

  const handleInvertRollOver = () => {
    setIsRollOver((prev) => !prev)
  }

  const [isSubmitting] = useState(false)

  const handleSubmitBet = async () => {
    if (!connected) {
      setIsDialogOpen(true)
      return
    }

    if (!client || !amount) {
      console.error('Cannot place without account')
      return
    }

    const response = await client.useABI(ABI).place_coin({
      type_arguments: [APTOS_COIN],
      arguments: [ORIGIN, isRollOver, expectNumber * 100, parseApt(amount)],
    })

    const tx = await aptos.waitForTransaction({
      transactionHash: response.hash,
    }).then((tx) => tx as UserTransactionResponse)
    const data = tx.events.find((e) => e.type.endsWith("::dice::Dice"))?.data
    console.log("Dice", data)

    console.log("Dice actual_hundredths", data.actual_hundredths)
    setDiceResult(data.actual_hundredths / 100)

    toast({
      variant: "default",
      title: data.pay_ratio_bps > 0 ? "You won!" : "You lost!",
    })
  }

  return (
    <Card className="border-none shadow-none sm:shadow sm:border-solid">
      <CardHeader className="gap-4 pb-2">
        <div className="flex items-center justify-between mx-auto space-x-2">
          <AmountInput amount={amount} onChangeAmount={(am) => setAmount(am)}/>
        </div>
      </CardHeader>

      <CardContent className="mt-20">
        <DiceSlider
          rollOver={expectNumber}
          handleSlide={handleSlideNumber}
          inverted={isRollOver}
          result={diceResult}
        />
        <div className="flex flex-row items-center justify-between mt-10">
          <div className="flex flex-col flex-1 mr-3">
            <p className="text-base mb-1">Multiplier</p>
            <div className="flex flex-row border-1 rounded-md justify-between border-[1px] divide-solid border-slate-300 px-3 py-2">
              <p className="text-base">{payout}</p>
              <span>x</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 mr-3">
            <p className="text-base mb-1 whitespace-nowrap">
              {isRollOver ? "Roll Over" : "Roll Under"}
            </p>
            <div className="flex flex-row border-1 rounded-md justify-between border-[1px] divide-solid border-slate-300 px-3 py-2">
              <p className="text-base">
                {isRollOver ? 100 - expectNumber : expectNumber}
              </p>
              <div
                onClick={() => handleInvertRollOver()}
                className="flex items-center hover:bg-slate-200 p-1 rounded-sm cursor-pointer"
              >
                <ArrowLeftRight width={16} height={16} />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-base mb-1 whitespace-nowrap">Win Chance</p>
            <div className="flex flex-row border-1 rounded-md justify-between border-[1px] divide-solid border-slate-300 px-3 py-2">
              <p className="text-base">{winChange}</p>
              <span>%</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full select-none"
          onClick={handleSubmitBet}
          disabled={isSubmitting}
        >
            Bet
        </Button>
      </CardFooter>

      {isDialogOpen &&  (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ConnectWalletDialog close={() => setIsDialogOpen(false)} />
        </Dialog>
      )}
    </Card>
  )
}
