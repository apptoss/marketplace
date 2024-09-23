import { useBalance } from "@/hooks/use-balance"
import { Redeem } from "./redeem-dialog"

export function Balance() {
  const { balance, credits } = useBalance()

  return (
    <div className="w-[350px] mx-auto">
      <div className="text-sm text-muted-foreground">Total Balance (APT)</div>
      <div className="flex justify-between">
        <div className="flex space-x-2 items-baseline">
          <div className="text-4xl font-semibold">{balance}</div>
          <div className="text-sm text-muted-foreground">{credits} credits</div>
        </div>
        <Redeem />
      </div>
    </div>
  )
}