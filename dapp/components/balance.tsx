import { aptos } from "@/aptos/client"
import { formatApt } from "@/lib/units"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useEffect, useState } from "react"

export function Balance() {
  const { account } = useWallet()
  const [amount, setAmount] = useState('0')

  useEffect(() => {
    if (!account) return
    aptos.getAccountCoinAmount({
      accountAddress: account.address,
      coinType: APTOS_COIN,
    }).then((octa) => {
      setAmount(formatApt(octa))
    })
  }, [account])

  return (<div>{amount} APT</div>)
}