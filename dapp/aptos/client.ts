import { NETWORK } from "@/constants"
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import { createSurfClient } from '@thalalabs/surf'

// Reuse same Aptos instance to utilize cookie based sticky routing
export const aptos = new Aptos(new AptosConfig({ network: NETWORK }))

export const client = createSurfClient(aptos)
