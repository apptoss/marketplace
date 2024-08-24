export function formatApt(octa: number): string {
  return (octa / 1e8).toFixed(2)
}