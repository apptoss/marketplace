import {
	AbstractedAccount,
	type Ed25519Account,
	Serializer,
} from "@aptos-labs/ts-sdk"
import type { AccountInfo } from "@aptos-labs/wallet-adapter-react"
import { SessionPackageId } from "@/core/bearium"

export const authenticationFunction = `${SessionPackageId}::delegation::authenticate`

export function toSession(master: AccountInfo, agent: Ed25519Account) {
	return new AbstractedAccount({
		accountAddress: master.address,
		signer: (digest) => {
			const serializer = new Serializer()
			agent.publicKey.serialize(serializer)
			agent.sign(digest).serialize(serializer)
			return serializer.toUint8Array()
		},
		authenticationFunction,
	})
}
