import { useMemo, useState } from 'react'
import type { FactorDataset } from '../lib/data'
import { FACTOR_DEFS, type FactorKey } from '../lib/factors'
import { annualizeReturn, annualizeVol, cumulativeGrowth, mean, sharpeRatio, stdev } from '../lib/stats'
import { formatRatio, formatSignedPercent } from '../lib/format'
import { GrowthChart } from './GrowthChart'

interface Props {
  data: FactorDataset
}

const MODELS: { name: string; adds: string }[] = [
  { name: 'CAPM', adds: 'Market only' },
  { name: 'Fama-French 3 (1993)', adds: '+ Size (SMB), Value (HML)' },
  { name: 'Carhart 4 (1997)', adds: '+ Momentum (WML)' },
  { name: 'Fama-French 5 (2015)', adds: '+ Profitability (RMW), Investment (CMA)' },
  { name: 'Fama-French 6', adds: 'FF5 + Momentum — all six factors' },
]

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--text-muted)',
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{children}</div>
    </div>
  )
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
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Factor library &amp; definitions</h2>
        <p style={{ fontSize: 13 }}>
          Growth of ₹100 invested in each standalone factor spread (2003–2026). Each factor is a zero-cost long–short
          portfolio; the cards below give the formal definition, the sorting variable, and the economic rationale for
          every factor. Use the <em>Hide</em> toggle on a card to remove its line from the chart.
        </p>
      </div>

      <details
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: 13,
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
          About the factor models (CAPM → FF3 → Carhart → FF5 → FF6)
        </summary>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 12.5, marginBottom: 4 }}>
            Each model is an asset-pricing equation: a security’s expected excess return equals its exposure (beta) to
            each factor times that factor’s risk premium. Later models add factors that earlier ones could not explain.
          </p>
          {MODELS.map((m) => (
            <div key={m.name} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
              <span style={{ minWidth: 168, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{m.adds}</span>
            </div>
          ))}
        </div>
      </details>

      <GrowthChart
        months={data.months}
        series={rows
          .filter((r) => !hidden.has(r.def.key))
          .map((r) => ({ id: r.def.key, label: r.def.label, color: r.def.color, growth: r.growth }))}
        height={380}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {rows.map((r) => (
          <div
            key={r.def.key}
            style={{
              background: 'var(--surface-1)',
              border: `1px solid ${hidden.has(r.def.key) ? 'var(--border)' : r.def.color}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: hidden.has(r.def.key) ? 0.6 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: r.def.color, display: 'inline-block' }} />
                  <strong style={{ fontSize: 15 }}>{r.def.label}</strong>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {r.def.technicalName} · {r.def.group}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(r.def.key)}
                style={{
                  flexShrink: 0,
                  border: '1px solid var(--border-strong)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)',
                  borderRadius: 6,
                  padding: '3px 10px',
                  cursor: 'pointer',
                  fontSize: 11.5,
                }}
              >
                {hidden.has(r.def.key) ? 'Show' : 'Hide'}
              </button>
            </div>

            <Section label="Sorted on">{r.def.sortVariable}</Section>
            <Section label="Definition">{r.def.definition}</Section>
            <Section label="Why the premium exists">{r.def.rationale}</Section>

            <div
              className="tabular"
              style={{
                display: 'flex',
                gap: 16,
                fontSize: 12.5,
                paddingTop: 8,
                borderTop: '1px solid var(--border)',
              }}
            >
              <span>
                Ann. return{' '}
                <strong style={{ color: r.annReturn >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                  {formatSignedPercent(r.annReturn)}
                </strong>
              </span>
              <span>
                Ann. vol <strong>{formatSignedPercent(r.annVol).replace('+', '')}</strong>
              </span>
              <span>
                Sharpe <strong>{formatRatio(r.sharpe)}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
