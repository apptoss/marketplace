import { AccountAddress } from "@aptos-labs/ts-sdk"
import { z } from "zod"

export const referralSearchSchema = z.object({
	ref: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val) return true // Allow empty or undefined
				try {
					AccountAddress.fromString(val)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid Aptos address in ref parameter" },
		)
		.catch(""),
})
