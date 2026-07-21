import type { FactorDataset } from '../lib/data'
import { FACTOR_MAP } from '../lib/factors'
import { formatRatio, formatSignedPercent } from '../lib/format'
import type { SavedPortfolio } from '../lib/saved'
import { GrowthChart } from './GrowthChart'

interface Props {
  data: FactorDataset
  saved: SavedPortfolio[]
  onRemove: (id: string) => void
  onClear: () => void
}

const METRICS: { key: keyof SavedPortfolio['result']; label: string; fmt: (v: number) => string }[] = [
  { key: 'annReturn', label: 'Ann. return', fmt: (v) => formatSignedPercent(v) },
  { key: 'annVol', label: 'Ann. volatility', fmt: (v) => formatSignedPercent(v).replace('+', '') },
  { key: 'sharpe', label: 'Sharpe', fmt: (v) => formatRatio(v) },
  { key: 'maxDrawdown', label: 'Max drawdown', fmt: (v) => formatSignedPercent(v).replace('+', '') },
  { key: 'bestMonth', label: 'Best month', fmt: (v) => formatSignedPercent(v) },
  { key: 'worstMonth', label: 'Worst month', fmt: (v) => formatSignedPercent(v) },
  { key: 'upsideCapture', label: 'Upside capture', fmt: (v) => formatRatio(v) },
  { key: 'downsideCapture', label: 'Downside capture', fmt: (v) => formatRatio(v) },
]

export function CompareTab({ data, saved, onRemove, onClear }: Props) {
  if (saved.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 18 }}>Compare</h2>
        <p style={{ fontSize: 13 }}>
          Nothing saved yet. Add up to {5} portfolios from the Builder or Best Portfolios tabs to compare them here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Compare portfolios</h2>
          <p style={{ fontSize: 13 }}>
            {saved.length} of 5 saved. Tip: click the <strong>✕</strong> on any column to remove that portfolio, or “Clear
            all” to reset.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          style={{ background: 'none', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5 }}
        >
          Clear all
        </button>
      </div>

      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
        <GrowthChart
          months={data.months}
          series={saved.map((s) => ({ id: s.id, label: s.label, color: s.color, growth: s.result.growth }))}
          height={380}
        />
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        <table style={{ width: '100%', fontSize: 12.5, minWidth: 560 }}>
          <thead>
            <tr style={{ background: 'var(--surface-1)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Metric</th>
              {saved.map((s) => (
                <th key={s.id} style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.label}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => onRemove(s.id)}
                      aria-label={`Remove ${s.label}`}
                      title="Remove this portfolio"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{m.label}</td>
                {saved.map((s) => (
                  <td key={s.id} className="tabular" style={{ padding: '6px 12px', textAlign: 'right' }}>
                    {m.fmt(s.result[m.key] as number)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>Factors</td>
              {saved.map((s) => (
                <td key={s.id} style={{ padding: '6px 12px', textAlign: 'right' }}>
                  {s.result.factors.map((f) => FACTOR_MAP[f].short).join(', ')}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
