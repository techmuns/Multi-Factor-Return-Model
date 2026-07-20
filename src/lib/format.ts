export function formatPercent(x: number, digits = 2): string {
  return `${(x * 100).toFixed(digits)}%`
}

export function formatSignedPercent(x: number, digits = 2): string {
  const sign = x > 0 ? '+' : ''
  return `${sign}${(x * 100).toFixed(digits)}%`
}

export function formatRatio(x: number, digits = 2): string {
  return x.toFixed(digits)
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
