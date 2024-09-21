import { ABI } from "@/aptos/abis/friend_pool-abi"
import { aptos, client } from "@/aptos/client"
import { ORIGIN } from "@/constants"
import { formatApt } from "@/lib/units"
import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useEffect, useState } from "react"

export const useBalance = () => {
  const { account } = useWallet()
  const [amount, setAmount] = useState(0)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (!account) return
    
    aptos.getAccountCoinAmount({
      accountAddress: account.address,
      coinType: APTOS_COIN,
    }).then((octa) => {
      setAmount(octa)
    })

    client.useABI(ABI).view.get_credit_coin({
      functionArguments: [ORIGIN, account.address as `0x${string}`],
      typeArguments: [APTOS_COIN],
    }).then(([octa]) => {
      console.log('credits', octa)
      setCredits(Number(octa))
    })

    client.useABI(ABI).view.get_pool_address_coin({
      functionArguments: [ORIGIN],
      typeArguments: [APTOS_COIN],
    }).then((poolAddress) => {
      aptos.getAccountCoinAmount({
        accountAddress: poolAddress[0],
        coinType: APTOS_COIN,
      }).then((octa) => {
        console.log('pool available', formatApt(octa))
      })
    })
  }, [account])

  return { balance: formatApt(amount + credits), amount: formatApt(amount), credits: formatApt(credits) }
}
