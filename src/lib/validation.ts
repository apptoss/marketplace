import { z } from "zod"

// Validation schema for transaction hash
export const transactionHashSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format")
	.describe("A valid Aptos transaction hash")

// Schema for route parameters containing transaction hash
export const transactionHashParamsSchema = z.object({
	transactionHash: transactionHashSchema,
})
