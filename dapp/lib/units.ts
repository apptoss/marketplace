export function formatApt(octa: number): string {
  return (Math.floor(octa * 100 / 1e8) / 100).toString()
}

export function parseApt(apt: number): number {
  return Math.floor(apt * 1e8)
}