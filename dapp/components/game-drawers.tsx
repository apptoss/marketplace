import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { FortyTwo } from "@/games/coinflip/forty-two"
import { Dice } from "@/games/dice"
import { Limbo } from "@/games/limbo"
import { BadgeCent, Dices, Rocket } from "lucide-react"

export function GameDrawerSection() {
  return (
    <div className="sm:hidden mx-auto w-[350px] space-y-1">
      <div className="text-sm text-muted-foreground">Original Games</div>
      <GameDrawers />
    </div>
  )
}

export function GameDrawers() {
  return (
    <ToggleGroup type="single" variant="outline" size="lg" className="justify-start">
      <Drawer>
        <DrawerTrigger asChild>
          <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-14">
            <Dices className="w-8" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent className="h-[75vh]">
          <DrawerHeader className="px-8 flex justify-between">
            <DrawerTitle>Dice</DrawerTitle>
            <DrawerDescription>RTP (Return to player) 99%</DrawerDescription>
          </DrawerHeader>
          <div className="mx-auto p-2">
            <Dice />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer>
        <DrawerTrigger asChild>
          <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-14">
            <Rocket className="w-8" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent className="h-[75vh]">
          <DrawerHeader className="px-8 flex justify-between">
            <DrawerTitle>Limbo</DrawerTitle>
            <DrawerDescription>RTP (Return to player) 99%</DrawerDescription>
          </DrawerHeader>
          <div className="mx-auto p-2">
            <Limbo />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer>
        <DrawerTrigger asChild>
          <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-14">
            <BadgeCent className="w-8" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent className="h-[75vh]">
          <DrawerHeader className="px-8 flex justify-between">
            <DrawerTitle>Forty Two</DrawerTitle>
            <DrawerDescription>RTP (Return to player) 99%</DrawerDescription>
          </DrawerHeader>
          <div className="mx-auto p-2">
            <FortyTwo />
          </div>
        </DrawerContent>
      </Drawer>
    </ToggleGroup>
  )
}