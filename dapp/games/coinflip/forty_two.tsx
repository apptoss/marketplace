import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function FortyTwo() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <Card
        className="max-w-xs" x-chunk="charts-01-chunk-4"
      >
        <CardContent className="gap-4 p-4 pb-2">
          <div className="flex items-center justify-between mx-auto space-x-2">
            <Input
              id="amount"
              type="number"
              defaultValue="1"
              disabled
            />
            <div>APT</div>
            <ToggleGroup
              type="single"
              defaultValue="s"
              variant="outline"
              disabled
            >
              <ToggleGroupItem value="s">1</ToggleGroupItem>
              <ToggleGroupItem value="m">10</ToggleGroupItem>
              <ToggleGroupItem value="l">100</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row border-t p-4">
          <div className="flex w-full items-center gap-2">
            <div className="grid flex-1 auto-rows-min gap-0.5">
              <div className="text-xs text-muted-foreground">Series</div>
              <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                3
              </div>
            </div>
            <Button>
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                4
              </div>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-10 w-px" />
            <Button>
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                2
              </div>
            </Button>
            <div className="grid flex-1 auto-rows-min gap-0.5">
              <div className="text-xs text-muted-foreground">Multiplier</div>
              <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                <span className="text-sm font-normal text-muted-foreground">
                  x
                </span>
                1.98
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}