import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { FortyTwo } from "@/games/coinflip/forty-two"
import { Dice } from "@/games/dice"
import { Limbo } from "@/games/limbo"
import { BadgeCent, Dices, Rocket } from "lucide-react"

export function GameTabs() {
  return (
    <Tabs defaultValue="forty-two" className="w-[350px] mx-auto hidden sm:grid">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dice"><Dices className="w-3.5 h-3.5 mr-1" />Dice</TabsTrigger>
        <TabsTrigger value="limbo"><Rocket className="w-3.5 h-3.5 mr-1" />Limbo</TabsTrigger>
        <TabsTrigger value="forty-two"><BadgeCent className="w-3.5 h-3.5 mr-1" />42</TabsTrigger>
      </TabsList>
      <TabsContent value="dice">
        <Dice />
      </TabsContent>
      <TabsContent value="limbo">
        <Limbo />
      </TabsContent>
      <TabsContent value="forty-two">
        <FortyTwo />
      </TabsContent>
    </Tabs>
  )
}
