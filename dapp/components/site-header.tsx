import { WalletSelector } from "./wallet-selector"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 justify-end space-x-2">
          <WalletSelector />
        </div>
      </div>
    </header>
  )
}