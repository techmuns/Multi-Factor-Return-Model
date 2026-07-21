import type { PortfolioResult } from './portfolio'

export interface SavedPortfolio {
  id: string
  label: string
  color: string
  result: PortfolioResult
}

export const MAX_SAVED = 5

let counter = 0
export function nextId(): string {
  counter += 1
  return `p${counter}`
}

/** A stable fingerprint of a portfolio: identical factors, weighting mode, and
 * (rounded) weights produce the same signature. Used to detect exact duplicates
 * so an accidental double-click doesn't add the same portfolio twice. */
export function signatureOf(result: PortfolioResult): string {
  const weights = result.weights.map((w) => w.toFixed(4)).join(',')
  return `${result.factors.join('+')}|${result.weightMode}|${weights}`
}

export type SaveStatus = 'added' | 'duplicate' | 'full'
