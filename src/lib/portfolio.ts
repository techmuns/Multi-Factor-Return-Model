import type { FactorDataset } from './data'
import { seriesFor } from './data'
import type { FactorKey } from './factors'
import { equalWeights, portfolioReturns, tangencyWeights } from './optimize'
import {
  annualizeReturn,
  annualizeVol,
  bestWorstMonth,
  captureRatios,
  covMatrix,
  cumulativeGrowth,
  maxDrawdown,
  mean,
  meanVector,
  sharpeRatio,
  stdev,
} from './stats'

export type WeightMode = 'optimized' | 'equal' | 'manual'

export interface PortfolioResult {
  factors: FactorKey[]
  weights: number[]
  weightMode: WeightMode
  months: string[]
  monthlyReturns: number[]
  growth: number[]
  annReturn: number
  annVol: number
  sharpe: number
  maxDrawdown: number
  bestMonth: number
  worstMonth: number
  upsideCapture: number
  downsideCapture: number
}

export function buildPortfolio(
  data: FactorDataset,
  factors: FactorKey[],
  weightMode: WeightMode,
  manualWeights?: number[],
): PortfolioResult {
  if (factors.length === 0) throw new Error('Select at least one factor')

  const matrix = seriesFor(data, factors)
  const mu = meanVector(matrix)
  const cov = covMatrix(matrix)

  let weights: number[]
  if (weightMode === 'manual' && manualWeights) {
    const gross = manualWeights.reduce((s, v) => s + Math.abs(v), 0) || 1
    weights = manualWeights.map((w) => w / gross)
  } else if (weightMode === 'equal') {
    weights = equalWeights(factors.length)
  } else {
    weights = tangencyWeights(cov, mu)
  }

  const monthlyReturns = portfolioReturns(matrix, weights)
  const growth = cumulativeGrowth(monthlyReturns)
  const annReturn = annualizeReturn(mean(monthlyReturns))
  const annVol = annualizeVol(stdev(monthlyReturns))
  const { best, worst } = bestWorstMonth(monthlyReturns)
  const { upside, downside } = captureRatios(monthlyReturns, data.returns.MKT_RF)

  return {
    factors,
    weights,
    weightMode,
    months: data.months,
    monthlyReturns,
    growth,
    annReturn,
    annVol,
    sharpe: sharpeRatio(annReturn, annVol),
    maxDrawdown: maxDrawdown(growth),
    bestMonth: best,
    worstMonth: worst,
    upsideCapture: upside,
    downsideCapture: downside,
  }
}
