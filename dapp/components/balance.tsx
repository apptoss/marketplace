import { aptos } from "@/aptos/client"
import { formatApt } from "@/lib/units"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useEffect, useState } from "react"

export const useBalance = () => {
  const { account } = useWallet()
  const [amount, setAmount] = useState('0.00')

  useEffect(() => {
    if (!account) return
    aptos.getAccountCoinAmount({
      accountAddress: account.address,
      coinType: APTOS_COIN,
    }).then((octa) => {
      setAmount(formatApt(octa))
    })
  }, [account])

  return { balance: amount }
}

export function Balance() {
  const { balance } = useBalance()

  return (
    <div className="w-[350px] mx-auto">
      <div className="text-sm text-muted-foreground">Total Balance (APT)</div>
      <div className="text-4xl font-semibold">{balance}</div>
    </div>
  )
}