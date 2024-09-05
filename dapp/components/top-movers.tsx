import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TopMoverSection() {
  return (
    <div className="mx-auto w-[350px] space-y-1">
      <div className="text-sm text-muted-foreground sm:hidden">Top Movers</div>
      <TopMovers />
    </div>
  )
}

export function TopMovers() {
  return (
    <Tabs defaultValue="recent">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recent">Recent Bets</TabsTrigger>
        <TabsTrigger value="high-rollers">High Rollers</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}