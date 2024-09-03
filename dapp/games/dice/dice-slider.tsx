import { Slider } from "@/components/ui/slider"

interface Props {
  rollOver: number
  handleSlide: (newRollNumber: number[]) => void
  inverted: boolean
  result: number | null
}

const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 50,
    label: "50",
  },
  {
    value: 100,
    label: "100",
  },
]

export default function DiceSlider({
  rollOver,
  handleSlide,
  inverted,
  result,
}: Props) {
  return (
    <div className="relative">
      {result !== null && (
        <div
          className="absolute left-[0.75rem] right-0 top-0 w-[calc(100% - 24px)] top-[-90%]"
          style={{
            width: "calc(100% - 24px)",
          }}
        >
          <div
            className="absolute"
            style={{
              left: `${result}%`,
              transition: "all ease 0.2s",
              transform: "translate(-50%)",
            }}
          >
            <img
              src="/dice.png"
              alt="dice"
              className="min-w-[32px]"
              width={32}
              height={32}
            />
            <p className="text-sm font-medium text-center mt-1">{result}</p>
          </div>
        </div>
      )}
      <Slider
        value={[rollOver]}
        step={1}
        onValueChange={handleSlide}
        inverted={inverted}
        className="cursor-pointer p-3 rounded-2xl after"
      />
      <div className="slider-mark mt-4 px-3 max-w-full flex flex-row justify-between">
        {marks.map((mark, index) => (
          <span
            className={index === 0 ? "translate-x-[-50%]" : "translate-x-[50%]"}
            key={mark.value}
          >
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  )
}
