export function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

export function sampleCovariance(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 2) return 0
  const mx = mean(xs)
  const my = mean(ys)
  let s = 0
  for (let i = 0; i < n; i++) s += (xs[i] - mx) * (ys[i] - my)
  return s / (n - 1)
}

export function covMatrix(matrix: number[][]): number[][] {
  // matrix: T x k
  const k = matrix[0]?.length ?? 0
  const cols: number[][] = Array.from({ length: k }, (_, j) => matrix.map((row) => row[j]))
  const cov = Array.from({ length: k }, () => new Array(k).fill(0))
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      const c = sampleCovariance(cols[i], cols[j])
      cov[i][j] = c
      cov[j][i] = c
    }
  }
  return cov
}

export function meanVector(matrix: number[][]): number[] {
  const k = matrix[0]?.length ?? 0
  const cols: number[][] = Array.from({ length: k }, (_, j) => matrix.map((row) => row[j]))
  return cols.map(mean)
}

export function annualizeReturn(monthlyMean: number): number {
  return Math.pow(1 + monthlyMean, 12) - 1
}

export function annualizeVol(monthlyStd: number): number {
  return monthlyStd * Math.sqrt(12)
}

export function stdev(xs: number[]): number {
  return Math.sqrt(sampleCovariance(xs, xs))
}

export function sharpeRatio(annReturn: number, annVol: number): number {
  if (annVol === 0) return 0
  return annReturn / annVol
}

export function cumulativeGrowth(returns: number[], base = 100): number[] {
  const out: number[] = []
  let level = base
  for (const r of returns) {
    level *= 1 + r
    out.push(level)
  }
  return out
}

export function maxDrawdown(growth: number[]): number {
  let peak = -Infinity
  let worst = 0
  for (const v of growth) {
    peak = Math.max(peak, v)
    const dd = (v - peak) / peak
    worst = Math.min(worst, dd)
  }
  return worst
}

export function bestWorstMonth(returns: number[]): { best: number; worst: number } {
  if (returns.length === 0) return { best: 0, worst: 0 }
  return { best: Math.max(...returns), worst: Math.min(...returns) }
}

/** Ratio of average portfolio return to average benchmark return, computed only over
 *  months where the benchmark is positive (upside) or negative (downside). */
export function captureRatios(portfolio: number[], benchmark: number[]): { upside: number; downside: number } {
  const upP: number[] = []
  const upB: number[] = []
  const downP: number[] = []
  const downB: number[] = []
  for (let i = 0; i < benchmark.length; i++) {
    if (benchmark[i] > 0) {
      upP.push(portfolio[i])
      upB.push(benchmark[i])
    } else if (benchmark[i] < 0) {
      downP.push(portfolio[i])
      downB.push(benchmark[i])
    }
  }
  const upside = upB.length ? mean(upP) / mean(upB) : 0
  const downside = downB.length ? mean(downP) / mean(downB) : 0
  return { upside, downside }
}
