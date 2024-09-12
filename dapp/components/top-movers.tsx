import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader } from "./ui/card"

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
      <TabsContent value="recent">
        <Card>
          <CardHeader>
            <SkeletonDemo />
            <SkeletonDemo />
            <SkeletonDemo />
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="high-rollers">
        <Card>
          <CardHeader>
            <SkeletonDemo />
            <SkeletonDemo />
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
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