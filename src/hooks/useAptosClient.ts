import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import { getAptosNetwork } from "@/core/bearium"

const config = new AptosConfig({ network: getAptosNetwork() })
const aptos = new Aptos(config)

export function useAptosClient() {
	return aptos
}
