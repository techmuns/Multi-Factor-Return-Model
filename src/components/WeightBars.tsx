import { FACTOR_MAP, type FactorKey } from '../lib/factors'
import { formatSignedPercent } from '../lib/format'

interface Props {
  factors: FactorKey[]
  weights: number[]
}

export function WeightBars({ factors, weights }: Props) {
  const maxAbs = Math.max(...weights.map((w) => Math.abs(w)), 0.01)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {factors.map((f, i) => {
        const w = weights[i]
        const def = FACTOR_MAP[f]
        const widthPct = (Math.abs(w) / maxAbs) * 50
        return (
          <div key={f} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: def.color, display: 'inline-block', flexShrink: 0 }} />
              {def.label}
            </div>
            <div style={{ position: 'relative', height: 16, background: 'var(--border)', borderRadius: 4, opacity: 0.35 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: w >= 0 ? '50%' : `${50 - widthPct}%`,
                  width: `${widthPct}%`,
                  background: def.color,
                  borderRadius: 4,
                  opacity: 0.9,
                }}
              />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-strong)' }} />
            </div>
            <div className="tabular" style={{ fontSize: 13, textAlign: 'right', color: 'var(--text-primary)' }}>
              {formatSignedPercent(w, 0)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
