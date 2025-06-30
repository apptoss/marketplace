import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DecimalInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	value: string
	onValueChange: (value: string) => void
	isValid?: boolean
	showError?: boolean
}

export const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(
	(
		{
			value,
			onValueChange,
			isValid = true,
			showError = false,
			className,
			...props
		},
		ref,
	) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target
			if (inputValue === "") {
				onValueChange("")
				return
			}

			// Allow only one decimal separator and remove non-numeric characters.
			let sanitizedValue = inputValue.replace(/,/g, ".")
			const parts = sanitizedValue.split(".")
			if (parts.length > 2) {
				sanitizedValue = `${parts[0]}.${parts.slice(1).join("")}`
			}
			sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, "")

			// Handle leading zeros.
			// e.g., "01" -> "1", "00.5" -> "0.5"
			if (sanitizedValue.includes(".")) {
				const [integer, fractional] = sanitizedValue.split(".")
				const newInteger = integer.length > 0 ? String(Number(integer)) : "0"
				sanitizedValue = `${newInteger}.${fractional}`
			} else {
				sanitizedValue = String(Number(sanitizedValue))
			}

			onValueChange(sanitizedValue)
		}

		return (
			<Input
				ref={ref}
				type="text"
				inputMode="decimal"
				pattern="[0-9]*[.,]?[0-9]*"
				value={value}
				onChange={handleChange}
				className={cn(showError && !isValid && "border-red-500", className)}
				{...props}
			/>
		)
	},
)

DecimalInput.displayName = "DecimalInput"
