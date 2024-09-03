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
import { Dice } from "@/games/dice/dice"
import { Limbo } from "@/games/limbo"
import { BadgeCent, Dice3, Rocket } from "lucide-react"

export function GameDrawers() {
  return (
    <ToggleGroup type="single" variant="outline" size="lg" className="sm:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Rocket className="h-4 w-4" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
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
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Dice3 className="h-4 w-4" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
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
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <BadgeCent className="h-4 w-4" />
          </ToggleGroupItem>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
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