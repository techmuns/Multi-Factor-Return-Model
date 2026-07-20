import { ALL_FACTOR_KEYS, type FactorKey } from './factors'

export interface FactorDataset {
  months: string[]
  returns: Record<FactorKey, number[]>
  rf: number[]
  rawMkt: number[]
  sourceRowCount: number
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  const header = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const cells = line.split(',')
    const row: Record<string, string> = {}
    header.forEach((h, i) => {
      row[h] = cells[i] ?? ''
    })
    return row
  })
}

let cached: FactorDataset | null = null

export async function loadFactorData(): Promise<FactorDataset> {
  if (cached) return cached

  const res = await fetch(`${import.meta.env.BASE_URL}data/ff5_factors_monthly.csv`)
  if (!res.ok) throw new Error(`Failed to load factor data: ${res.status}`)
  const text = await res.text()
  const rows = parseCsv(text)

  const months: string[] = []
  const returns: Record<FactorKey, number[]> = {
    MKT_RF: [], SMB: [], HML: [], WML: [], RMW: [], CMA: [],
  }
  const rf: number[] = []
  const rawMkt: number[] = []

  for (const row of rows) {
    const has = (col: string) => row[col] !== undefined && row[col] !== ''
    // Require every factor plus Rf to be present so all combinations share one common date range.
    const complete = ['SMB', 'HML', 'WML', 'RMW', 'CMA', 'MKT', 'Rf'].every(has)
    if (!complete) continue

    const mkt = parseFloat(row.MKT)
    const riskFree = parseFloat(row.Rf)

    months.push(row.Month)
    returns.MKT_RF.push(mkt - riskFree)
    returns.SMB.push(parseFloat(row.SMB))
    returns.HML.push(parseFloat(row.HML))
    returns.WML.push(parseFloat(row.WML))
    returns.RMW.push(parseFloat(row.RMW))
    returns.CMA.push(parseFloat(row.CMA))
    rf.push(riskFree)
    rawMkt.push(mkt)
  }

  cached = { months, returns, rf, rawMkt, sourceRowCount: rows.length }
  return cached
}

export function seriesFor(data: FactorDataset, keys: FactorKey[]): number[][] {
  // T x k matrix, T months, k factors
  return data.months.map((_, t) => keys.map((k) => data.returns[k][t]))
}

export function assertKeysValid(keys: FactorKey[]) {
  for (const k of keys) {
    if (!ALL_FACTOR_KEYS.includes(k)) throw new Error(`Unknown factor key: ${k}`)
  }
}
