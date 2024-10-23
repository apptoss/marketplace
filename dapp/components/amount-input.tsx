import { Input, InputProps } from "@/components/ui/input"
import { useBalance } from "@/hooks/use-balance"
import { useCallback } from "react"

export const AmountInput = ({
  amount,
  onChangeAmount,
  ...props
}: InputProps & { amount?: number| string; onChangeAmount: (amount: number| string) => void }) => {
  const { balance } = useBalance()
  const displayAmount = (() => {
    if (amount === undefined || isNaN(Number(amount))) return ''
    return amount
  })()

  const addPercentAmount = (percent: number) => {
    const am = (Number(amount) ?? 0) * (1 + percent / 100)
    onChangeAmount(am)
  }

  const parseValue = useCallback((targetValue: string) => {
    let val = targetValue

    if (isNaN(Number(targetValue))) {
      // when isNaN cause by decimal point, should change it from `,` to `.` or vice versus
      if (val.indexOf(',') >= 0) {
        const replaced = val.replace(',', '.')
        if (!isNaN(Number(replaced))) {
          val = replaced
        }
      } else if (val.indexOf('.') >= 0) {
        const replaced = val.replace('.', ',')
        if (!isNaN(Number(replaced))) {
          val = replaced
        }
      }
    }

    return val
  }, [])

  return (
    <div className='space-y-3'>
      <div className='flex justify-between gap-3 items-center w-full'>
        <Input
          id='amount'
          placeholder='0'
          type='text'
          pattern="[0-9]*"
          inputMode="decimal"
          className='border-none w-[80%] px-0 font-semibold text-4xl shadow-none focus-visible:ring-transparent'
          value={displayAmount}
          onChange={(e) => {
            onChangeAmount(parseValue(e.target.value))
          }}
          {...props}
        />
        <div className='font-medium flex gap-1 items-center'>
          <img src='/apt.svg' className='size-5'/>
          APT
        </div>
      </div>

      <div className='flex justify-between text-muted-foreground text-sm'>
        <div className='flex gap-2 font-semibold'>
          <button
            className='w-[28px] ring-1 px-1 py-[2px] rounded-lg ring-muted-foreground/50'
            onClick={() => addPercentAmount(-50)}
          >
            ½
          </button>
          <button
            className='w-[28px] ring-1 px-1 py-[2px] rounded-lg ring-muted-foreground/50'
            onClick={() => addPercentAmount(100)}
          >
            2×
          </button>
        </div>
        <div className='flex gap-2 items-center'>
          <div>{balance} APT</div>
          <button
            className='ring-1 px-1 py-[2px] rounded-lg ring-muted-foreground font-semibold'
            onClick={() => onChangeAmount(Number(balance))}
          >
            Max
          </button>
        </div>
      </div>
    </div>
  )
}
