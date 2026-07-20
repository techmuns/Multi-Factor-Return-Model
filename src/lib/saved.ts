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
