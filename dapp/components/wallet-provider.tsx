import { useToast } from "@/components/ui/use-toast"
import { NETWORK } from "@/constants"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { PropsWithChildren } from "react"

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast()

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK }}
      onError={(error) => {
        if ((error as string).includes("Transaction not found")) return
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        })
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
