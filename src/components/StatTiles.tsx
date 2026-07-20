import { formatPercent, formatRatio, formatSignedPercent } from '../lib/format'
import type { PortfolioResult } from '../lib/portfolio'

interface Props {
  result: PortfolioResult
}

export function StatTiles({ result }: Props) {
  const tiles = [
    { label: 'Annualized return', value: formatSignedPercent(result.annReturn), tone: result.annReturn >= 0 ? 'good' : 'bad' },
    { label: 'Annualized volatility', value: formatPercent(result.annVol), tone: 'neutral' },
    { label: 'Sharpe ratio', value: formatRatio(result.sharpe), tone: result.sharpe >= 0 ? 'good' : 'bad' },
    { label: 'Max drawdown', value: formatPercent(result.maxDrawdown), tone: 'bad' },
    { label: 'Best month', value: formatSignedPercent(result.bestMonth), tone: 'good' },
    { label: 'Worst month', value: formatSignedPercent(result.worstMonth), tone: 'bad' },
    { label: 'Upside capture', value: formatRatio(result.upsideCapture), tone: 'neutral' },
    { label: 'Downside capture', value: formatRatio(result.downsideCapture), tone: 'neutral' },
  ] as const

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t.label}</div>
          <div
            className="tabular"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.tone === 'good' ? 'var(--good)' : t.tone === 'bad' ? 'var(--bad)' : 'var(--text-primary)',
            }}
          >
            {t.value}
          </div>
        </div>
      ))}
    </div>
  )
}
