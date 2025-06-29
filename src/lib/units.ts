export function formatAmount(rawAmount: bigint, decimals: number): string {
	const divisor = BigInt(10 ** decimals)
	const wholePart = rawAmount / divisor
	const fractionalPart = rawAmount % divisor

	if (fractionalPart === 0n) {
		return wholePart.toString()
	}

	return `${wholePart}.${fractionalPart.toString().padStart(decimals, "0")}`
}
