import { aptos } from "@/aptos/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { APPTOSS_PACKAGE } from "@/constants"
import { formatApt } from "@/lib/units"
import { BadgeCent, Dices, Rocket } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardHeader } from "./ui/card"

export function TopMoverSection() {
  return (
    <div className="mx-auto w-[350px] space-y-1">
      <div className="text-sm text-muted-foreground sm:hidden">Top Movers</div>
      <TopMovers />
    </div>
  )
}

interface BetEvent {
  game: 'dice' | 'coinflip' | 'limbo',
  player: string
  pay_ratio: string
  transaction_version: number
  collateral: string
  payout: string
}

export function TopMovers() {
  const [recentBets, setRecentBets] = useState<BetEvent[]>([])
  
  useEffect(() => {
    aptos.getEvents({
      options: {
        where: {
          indexed_type: {
            _in: [
              `${APPTOSS_PACKAGE}::dice::Dice`,
              `${APPTOSS_PACKAGE}::limbo::Limbo`,
              `${APPTOSS_PACKAGE}::coinflip::CoinFlip`,
            ],
          },
        },
        orderBy: [{"transaction_block_height": "desc"}],
        limit: 20,
      },
    }).then((events) => {
      console.log("events", events)
      const data = events.map((ev) => {
        const collateral = Number(ev.data.collateral)
        const payout = ev.data.pay_ratio_bps > 0 ? collateral * Number(ev.data.pay_ratio_bps) / 10_000 : 0
        return {
          game: ev.type.split("::")[1] as 'dice' | 'coinflip' | 'limbo',
          player: ev.data.player,
          pay_ratio: (ev.data.pay_ratio_bps / 10_000).toString(),
          transaction_version: ev.transaction_version,
          collateral: formatApt(collateral),
          payout: formatApt(payout),
        }
      })
      console.log("data", data)
      setRecentBets(data)
    })
  }, [])
  
  return (
    <Tabs defaultValue="recent">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recent">Recent Bets</TabsTrigger>
        <TabsTrigger value="high-rollers">High Rollers</TabsTrigger>
      </TabsList>
      <TabsContent value="recent">
        <Card>
          <CardHeader className="grid gap-8">
            {recentBets.map((bet) => 
              <BetItem game={bet.game} player={bet.player} collateral={bet.collateral} multiplier={bet.pay_ratio} payout={bet.payout} key={bet.transaction_version} />
            )}
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="high-rollers">
        <Card>
          <CardHeader>
            <SkeletonDemo />
            <SkeletonDemo />
            <SkeletonDemo />
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export interface BetItemProps {
  game: 'dice' | 'coinflip' | 'limbo',
  player: string,
  collateral: string,
  multiplier: string,
  payout: string,
}

export function BetItem({ game, player, collateral, multiplier, payout }: BetItemProps) {
  return (
    <div className="flex items-center gap-4">
      {game === 'dice' && <Dices className="h-6 w-6" />}
      {game === 'coinflip' && <BadgeCent className="h-6 w-6" />}
      {game === 'limbo' && <Rocket className="h-6 w-6" />}
      
      <div className="grid gap-1">
        <p className="text-sm leading-none">Bet {collateral} APT {multiplier}×</p>
        <p className="text-sm leading-none max-w-[120px] truncate">{player}</p>
      </div>
      <div className="ml-auto font-medium">{payout}</div>
    </div>
  )
}

export function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[220px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}