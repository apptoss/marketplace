/**
 * Formats a bigint amount into a decimal string representation.
 * @param rawAmount The bigint amount.
 * @param decimals The number of decimal places.
 * @param options.trim If true, trims trailing zeros from the fractional part.
 * @returns A formatted decimal string.
 */
export function formatAmount(
	rawAmount: bigint,
	decimals: number,
	options?: { trim?: boolean },
): string {
	const divisor = 10n ** BigInt(decimals)
	const wholePart = rawAmount / divisor
	const fractionalPart = rawAmount % divisor

	if (fractionalPart === 0n) {
		return wholePart.toString()
	}

	let fractionalString = fractionalPart.toString().padStart(decimals, "0")

	if (options?.trim) {
		fractionalString = fractionalString.replace(/0+$/, "")
		if (fractionalString === "") {
			return wholePart.toString()
		}
	}

	return `${wholePart}.${fractionalString}`
}

/**
 * Parses a numeric string into a bigint, preventing precision loss.
 * It handles decimal and comma separators and truncates extra decimals.
 * @param input The numeric string to parse (e.g., "1,234.56").
 * @param decimals The number of decimal places for the bigint.
 * @returns A bigint representing the parsed amount.
 */
export function parseAmount(input: string, decimals: number): bigint {
	if (!input) return 0n

	// Normalize to dot for decimal separator
	const cleanInput = input.replace(/,/g, ".")

	const parts = cleanInput.split(".")
	if (parts.length > 2 || /[^0-9.]/.test(cleanInput)) {
		// Invalid format
		return 0n
	}

	let [wholeStr, fracStr] = parts
	wholeStr = wholeStr || "0"
	fracStr = fracStr || ""

	// Truncate fractional part to specified decimals
	if (fracStr.length > decimals) {
		fracStr = fracStr.slice(0, decimals)
	}

	const tenPowerDecimals = 10n ** BigInt(decimals)
	const wholeBigInt = BigInt(wholeStr) * tenPowerDecimals
	const fractionalBigInt = BigInt(fracStr.padEnd(decimals, "0"))

	return wholeBigInt + fractionalBigInt
}
