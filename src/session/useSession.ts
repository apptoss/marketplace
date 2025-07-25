import type { Ed25519Account } from "@aptos-labs/ts-sdk"
import { atom, useAtom } from "jotai"

export const sessionAtom = atom<Ed25519Account | null>(null)

export function useSession() {
	return useAtom(sessionAtom)
}
