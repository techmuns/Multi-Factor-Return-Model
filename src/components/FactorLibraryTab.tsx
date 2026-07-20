import { useMemo, useState } from 'react'
import type { FactorDataset } from '../lib/data'
import { FACTOR_DEFS, type FactorKey } from '../lib/factors'
import { annualizeReturn, annualizeVol, cumulativeGrowth, mean, sharpeRatio, stdev } from '../lib/stats'
import { formatRatio, formatSignedPercent } from '../lib/format'
import { GrowthChart } from './GrowthChart'

interface Props {
  data: FactorDataset
}

export function FactorLibraryTab({ data }: Props) {
  const [hidden, setHidden] = useState<Set<FactorKey>>(new Set())

  const rows = useMemo(
    () =>
      FACTOR_DEFS.map((f) => {
        const series = data.returns[f.key]
        const growth = cumulativeGrowth(series)
        const annReturn = annualizeReturn(mean(series))
        const annVol = annualizeVol(stdev(series))
        return { def: f, growth, annReturn, annVol, sharpe: sharpeRatio(annReturn, annVol) }
      }),
    [data],
  )

  function toggle(key: FactorKey) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Factor performance, 2003–2026</h2>
        <p style={{ fontSize: 13 }}>
          Growth of ₹100 invested in each standalone factor spread. Click a legend row below to hide/show a line — this is
          the historical upside/downside trend for every building block available to your portfolios.
        </p>
      </div>

      <GrowthChart
        months={data.months}
        series={rows.filter((r) => !hidden.has(r.def.key)).map((r) => ({ id: r.def.key, label: r.def.label, color: r.def.color, growth: r.growth }))}
        height={380}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {rows.map((r) => (
          <button
            key={r.def.key}
            type="button"
            onClick={() => toggle(r.def.key)}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              background: 'var(--surface-1)',
              border: `1px solid ${hidden.has(r.def.key) ? 'var(--border)' : r.def.color}`,
              borderRadius: 10,
              padding: 14,
              opacity: hidden.has(r.def.key) ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: r.def.color, display: 'inline-block' }} />
              <strong style={{ fontSize: 14 }}>{r.def.label}</strong>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.def.short} · {r.def.group}</span>
            </div>
            <p style={{ fontSize: 12.5, marginBottom: 8 }}>{r.def.description}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12.5 }} className="tabular">
              <span>Ann. return <strong style={{ color: r.annReturn >= 0 ? 'var(--good)' : 'var(--bad)' }}>{formatSignedPercent(r.annReturn)}</strong></span>
              <span>Sharpe <strong>{formatRatio(r.sharpe)}</strong></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
