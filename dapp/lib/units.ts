export function formatApt(octa: number): string {
  return (octa / 1e8).toFixed(2)
}

export function parseApt(apt: number): number {
  return Math.floor(apt * 1e8)
}