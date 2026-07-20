import { useEffect, useMemo, useState } from 'react'
import type { FactorDataset } from '../lib/data'
import { PRESETS, type FactorKey } from '../lib/factors'
import { buildPortfolio, type PortfolioResult, type WeightMode } from '../lib/portfolio'
import { MAX_SAVED } from '../lib/saved'
import { FactorChips } from './FactorChips'
import { GrowthChart } from './GrowthChart'
import { StatTiles } from './StatTiles'
import { WeightBars } from './WeightBars'

interface Props {
  data: FactorDataset
  savedCount: number
  onSave: (label: string, result: PortfolioResult) => void
}

const MODES: { id: WeightMode; label: string; hint: string }[] = [
  { id: 'optimized', label: 'Optimize weights (max Sharpe)', hint: 'Solves for the historical tangency weights across your chosen factors.' },
  { id: 'equal', label: 'Equal weight', hint: 'Splits allocation evenly across the chosen factors.' },
  { id: 'manual', label: 'Manual', hint: 'Set each factor’s weight yourself.' },
]

export function PortfolioBuilderTab({ data, savedCount, onSave }: Props) {
  const [selected, setSelected] = useState<FactorKey[]>(['MKT_RF', 'SMB', 'HML'])
  const [mode, setMode] = useState<WeightMode>('optimized')
  const [manualWeights, setManualWeights] = useState<Record<string, number>>({})

  useEffect(() => {
    setManualWeights((prev) => {
      const next: Record<string, number> = {}
      selected.forEach((k) => {
        next[k] = prev[k] ?? Math.round(100 / selected.length)
      })
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.join(',')])

  function toggleFactor(key: FactorKey) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const result = useMemo(() => {
    if (selected.length === 0) return null
    try {
      const manual = selected.map((k) => manualWeights[k] ?? 0)
      return buildPortfolio(data, selected, mode, mode === 'manual' ? manual : undefined)
    } catch {
      return null
    }
  }, [data, selected, mode, manualWeights])

  const label = selected.map((k) => k.replace('_RF', '')).join(' + ')
  const atCap = savedCount >= MAX_SAVED

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Build a portfolio</h2>
        <p style={{ fontSize: 13 }}>Pick factors, choose how to weight them, and see how the combination would have performed.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.factors)}
            title={p.description}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 12.5,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <FactorChips selected={selected} onToggle={toggleFactor} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            title={m.hint}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border-strong)'}`,
              background: mode === m.id ? 'var(--accent)' : 'transparent',
              color: mode === m.id ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'manual' && selected.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          {selected.map((k) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13 }}>{k.replace('_RF', '')}</span>
              <input
                type="range"
                min={-100}
                max={100}
                value={manualWeights[k] ?? 0}
                onChange={(e) => setManualWeights((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <span className="tabular" style={{ fontSize: 13, textAlign: 'right' }}>{manualWeights[k] ?? 0}%</span>
            </div>
          ))}
          <p style={{ fontSize: 11.5 }}>Weights are re-normalized so gross exposure sums to 100%.</p>
        </div>
      )}

      {!result && <p style={{ fontSize: 13 }}>Select at least one factor to see results.</p>}

      {result && (
        <>
          <StatTiles result={result} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 20 }}>
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
              <GrowthChart months={data.months} series={[{ id: 'p', label, color: 'var(--accent)', growth: result.growth }]} />
            </div>
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
              <h4 style={{ fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)' }}>Weights</h4>
              <WeightBars factors={result.factors} weights={result.weights} />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={atCap}
              onClick={() => onSave(label, result)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: atCap ? 'var(--border-strong)' : 'var(--accent)',
                color: '#fff',
                cursor: atCap ? 'not-allowed' : 'pointer',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              {atCap ? 'Compare list full (5/5)' : '+ Add to Compare'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
