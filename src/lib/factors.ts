export type FactorKey = 'MKT_RF' | 'SMB' | 'HML' | 'WML' | 'RMW' | 'CMA'

export interface FactorDef {
  key: FactorKey
  short: string
  label: string
  group: string
  description: string
  color: string
  colorDark: string
}

// Palette slots assigned in fixed categorical order (blue, green, magenta, yellow, aqua, orange)
export const FACTOR_DEFS: FactorDef[] = [
  {
    key: 'MKT_RF',
    short: 'MKT',
    label: 'Market',
    group: 'CAPM',
    description: 'Equity risk premium: broad market return minus the risk-free rate. The single CAPM factor.',
    color: '#2a78d6',
    colorDark: '#3987e5',
  },
  {
    key: 'SMB',
    short: 'SMB',
    label: 'Size',
    group: 'Fama-French',
    description: 'Small Minus Big: return of small-cap stocks over large-cap stocks.',
    color: '#008300',
    colorDark: '#008300',
  },
  {
    key: 'HML',
    short: 'HML',
    label: 'Value',
    group: 'Fama-French',
    description: 'High Minus Low: return of high book-to-market (value) stocks over low book-to-market (growth) stocks.',
    color: '#e87ba4',
    colorDark: '#d55181',
  },
  {
    key: 'WML',
    short: 'WML',
    label: 'Momentum',
    group: 'Carhart',
    description: 'Winners Minus Losers: return of recent winning stocks over recent losing stocks.',
    color: '#eda100',
    colorDark: '#c98500',
  },
  {
    key: 'RMW',
    short: 'RMW',
    label: 'Profitability',
    group: 'Fama-French 5',
    description: 'Robust Minus Weak: return of high-profitability stocks over low-profitability stocks.',
    color: '#1baf7a',
    colorDark: '#199e70',
  },
  {
    key: 'CMA',
    short: 'CMA',
    label: 'Investment',
    group: 'Fama-French 5',
    description: 'Conservative Minus Aggressive: return of low-investment stocks over high-investment stocks.',
    color: '#eb6834',
    colorDark: '#d95926',
  },
]

export const FACTOR_MAP: Record<FactorKey, FactorDef> = Object.fromEntries(
  FACTOR_DEFS.map((f) => [f.key, f]),
) as Record<FactorKey, FactorDef>

export const ALL_FACTOR_KEYS: FactorKey[] = FACTOR_DEFS.map((f) => f.key)

export interface Preset {
  id: string
  label: string
  description: string
  factors: FactorKey[]
}

export const PRESETS: Preset[] = [
  { id: 'capm', label: 'CAPM', description: 'Market factor only', factors: ['MKT_RF'] },
  { id: 'ff3', label: 'Fama-French 3', description: 'Market + Size + Value', factors: ['MKT_RF', 'SMB', 'HML'] },
  { id: 'carhart4', label: 'Carhart 4', description: 'FF3 + Momentum', factors: ['MKT_RF', 'SMB', 'HML', 'WML'] },
  { id: 'ff5', label: 'Fama-French 5', description: 'Market + Size + Value + Profitability + Investment', factors: ['MKT_RF', 'SMB', 'HML', 'RMW', 'CMA'] },
  { id: 'ff6', label: 'Fama-French 6', description: 'All six factors combined', factors: ['MKT_RF', 'SMB', 'HML', 'WML', 'RMW', 'CMA'] },
]

// Series colors reused for saved/compared portfolios (up to 5), fixed order.
export const PORTFOLIO_COLORS = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a']
export const PORTFOLIO_COLORS_DARK = ['#3987e5', '#008300', '#d55181', '#c98500', '#199e70']
