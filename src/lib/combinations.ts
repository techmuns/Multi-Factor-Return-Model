import type { FactorDataset } from './data'
import { ALL_FACTOR_KEYS, type FactorKey } from './factors'
import { buildPortfolio, type PortfolioResult } from './portfolio'

function powerSet(keys: FactorKey[]): FactorKey[][] {
  const subsets: FactorKey[][] = [[]]
  for (const key of keys) {
    const len = subsets.length
    for (let i = 0; i < len; i++) {
      subsets.push([...subsets[i], key])
    }
  }
  return subsets.filter((s) => s.length > 0)
}

export interface RankedPortfolio extends PortfolioResult {
  rank: number
  id: string
}

/** Evaluates every non-empty combination of the six factors (63 total) with
 * max-Sharpe optimized weights, and ranks them by Sharpe ratio, highest first. */
export function evaluateAllCombinations(data: FactorDataset): RankedPortfolio[] {
  const subsets = powerSet(ALL_FACTOR_KEYS)
  const results = subsets.map((factors) => buildPortfolio(data, factors, 'optimized'))
  results.sort((a, b) => b.sharpe - a.sharpe)
  return results.map((r, i) => ({
    ...r,
    rank: i + 1,
    id: r.factors.join('+'),
  }))
}

export const TOTAL_COMBINATIONS = Math.pow(2, ALL_FACTOR_KEYS.length) - 1
