/** Gauss-Jordan matrix inversion. Throws if the matrix is singular even after ridge regularization. */
export function invert(matrix: number[][]): number[][] {
  const n = matrix.length
  const aug: number[][] = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])

  for (let col = 0; col < n; col++) {
    let pivotRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivotRow][col])) pivotRow = row
    }
    if (Math.abs(aug[pivotRow][col]) < 1e-12) {
      throw new Error('Matrix is singular')
    }
    ;[aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]]

    const pivot = aug[col][col]
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = aug[row][col]
      if (factor === 0) continue
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j]
    }
  }

  return aug.map((row) => row.slice(n))
}

export function matVec(matrix: number[][], vec: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, v, j) => sum + v * vec[j], 0))
}

/**
 * Max-Sharpe (tangency) weights for a set of already-excess-return factors: w ∝ Σ⁻¹μ.
 * A small ridge term keeps the covariance invertible when factors are highly collinear
 * or when only one factor is selected. Weights are L1-normalized (sum of |w| = 1) so
 * short allocations are allowed without the raw solution exploding in scale.
 */
export function tangencyWeights(cov: number[][], mu: number[]): number[] {
  const k = mu.length
  const ridge = 1e-6 * Math.max(...cov.map((row, i) => Math.abs(row[i])), 1e-8)
  const regularized = cov.map((row, i) => row.map((v, j) => (i === j ? v + ridge : v)))
  const inv = invert(regularized)
  const raw = matVec(inv, mu)
  const gross = raw.reduce((s, v) => s + Math.abs(v), 0)
  if (gross < 1e-10) return raw.map(() => 1 / k)
  return raw.map((v) => v / gross)
}

export function equalWeights(k: number): number[] {
  return Array.from({ length: k }, () => 1 / k)
}

export function portfolioReturns(matrix: number[][], weights: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, v, j) => sum + v * weights[j], 0))
}
