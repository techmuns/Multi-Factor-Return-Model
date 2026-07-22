export type FactorKey = 'MKT_RF' | 'SMB' | 'HML' | 'WML' | 'RMW' | 'CMA'

export interface FactorDef {
  key: FactorKey
  short: string
  label: string
  group: string
  /** Plain one-line summary (used in chips and quick tooltips). */
  description: string
  /** Formal factor name, e.g. "SMB · Small Minus Big". */
  technicalName: string
  /** The firm characteristic stocks are sorted on to build the factor. */
  sortVariable: string
  /** Precise, analyst-grade construction of the long–short spread. */
  definition: string
  /** Economic rationale — why the premium exists (risk-based and/or behavioral). */
  rationale: string
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
    technicalName: 'MKT–RF · Market Risk Premium',
    sortVariable: 'None — the value-weighted market portfolio',
    definition:
      'The value-weighted return of the entire SCDLDS equity universe minus the risk-free rate (short-term T-bill). This is the single systematic factor in the CAPM; a stock’s exposure to it is its market beta (β).',
    rationale:
      'Compensation for bearing non-diversifiable (systematic) market risk. Because equities can fall sharply and this risk cannot be diversified away, risk-averse investors demand an expected return above the risk-free rate. Under CAPM, expected excess return = β × market premium.',
    color: '#2a78d6',
    colorDark: '#3987e5',
  },
  {
    key: 'SMB',
    short: 'SMB',
    label: 'Size',
    group: 'Fama-French 3',
    description: 'Small Minus Big: return of small-cap stocks over large-cap stocks.',
    technicalName: 'SMB · Small Minus Big',
    sortVariable: 'Market capitalization (price × shares outstanding)',
    definition:
      'A zero-cost long–short portfolio: long a diversified basket of small-cap stocks, short large-cap stocks, averaged across the value / profitability / investment sorts (2×3 breakpoints). A positive value means small caps outperformed large caps that month.',
    rationale:
      'Interpreted as compensation for greater systematic and liquidity risk — small firms are more exposed to downturns, financially more fragile, less liquid and less researched, so investors require a premium. Empirically the size premium is weak and unstable, and largely conditional on quality (small AND profitable, not small alone) — a risk-compensated tendency, not a rule that small always beats big.',
    color: '#008300',
    colorDark: '#008300',
  },
  {
    key: 'HML',
    short: 'HML',
    label: 'Value',
    group: 'Fama-French 3',
    description: 'High Minus Low: return of high book-to-market (value) stocks over low book-to-market (growth) stocks.',
    technicalName: 'HML · High Minus Low',
    sortVariable: 'Book-to-market ratio (book equity ÷ market equity)',
    definition:
      'A zero-cost spread: long high book-to-market (value) stocks, short low book-to-market (growth) stocks. A positive value means value outperformed growth that month.',
    rationale:
      'Two competing explanations. Risk-based (Fama-French): value firms are more often distressed or carry higher operating/financial leverage, so they earn a premium. Behavioral (Lakonishok-Shleifer-Vishny): investors over-extrapolate past growth, overpaying for glamour stocks and underpricing value, which then mean-reverts.',
    color: '#e87ba4',
    colorDark: '#d55181',
  },
  {
    key: 'WML',
    short: 'WML',
    label: 'Momentum',
    group: 'Carhart 4',
    description: 'Winners Minus Losers: return of recent winning stocks over recent losing stocks.',
    technicalName: 'WML · Winners Minus Losers',
    sortVariable: 'Prior 11-month return, skipping the most recent month (t−12 to t−2)',
    definition:
      'A zero-cost spread: long recent winners, short recent losers, ranked on trailing cumulative return (the latest month is skipped to avoid short-term reversal). A positive value means winners kept outperforming — the “2–12” momentum convention.',
    rationale:
      'Predominantly a behavioral anomaly — investor under-reaction to news, the disposition effect and herding cause price trends to persist over 3–12 month horizons. It is not well explained by risk, but carries sharp tail risk (“momentum crashes”) during abrupt market reversals, which is one risk-based justification for the premium.',
    color: '#eda100',
    colorDark: '#c98500',
  },
  {
    key: 'RMW',
    short: 'RMW',
    label: 'Profitability',
    group: 'Fama-French 5',
    description: 'Robust Minus Weak: return of high-profitability stocks over low-profitability stocks.',
    technicalName: 'RMW · Robust Minus Weak',
    sortVariable: 'Operating profitability (revenue − COGS − SG&A − interest, scaled by book equity)',
    definition:
      'A zero-cost spread: long firms with robust (high) operating profitability, short firms with weak (low) profitability. A positive value means profitable firms outperformed.',
    rationale:
      'Follows from the dividend-discount / valuation identity: holding book value and expected investment fixed, higher current profitability implies a higher expected return. Also read as a “quality” premium — profitable firms are more resilient, so RMW tends to cushion drawdowns.',
    color: '#1baf7a',
    colorDark: '#199e70',
  },
  {
    key: 'CMA',
    short: 'CMA',
    label: 'Investment',
    group: 'Fama-French 5',
    description: 'Conservative Minus Aggressive: return of low-investment stocks over high-investment stocks.',
    technicalName: 'CMA · Conservative Minus Aggressive',
    sortVariable: 'Asset growth (year-over-year change in total assets)',
    definition:
      'A zero-cost spread: long low-investment (“conservative”) firms, short high-investment (“aggressive”) firms, sorted on total-asset growth. A positive value means conservative firms outperformed. This measures how fast a firm expands its balance sheet — independent of its size.',
    rationale:
      'Grounded in q-theory / the investment-CAPM: firms invest aggressively when their cost of capital is low, which coincides with lower expected returns; disciplined, low-growth firms carry higher expected returns. A behavioral reading adds that markets overprice “empire-building” over-investment.',
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
