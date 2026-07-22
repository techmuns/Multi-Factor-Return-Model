import { useEffect, useMemo, useState } from 'react'
import type { FactorDataset } from '../lib/data'
import { PRESETS, type FactorKey } from '../lib/factors'
import { buildPortfolio, type PortfolioResult, type WeightMode } from '../lib/portfolio'
import { MAX_SAVED, signatureOf, type SaveStatus } from '../lib/saved'
import { CompareNotice } from './CompareNotice'
import { FactorChips } from './FactorChips'
import { GrowthChart } from './GrowthChart'
import { StatTiles } from './StatTiles'
import { WeightBars } from './WeightBars'

interface Props {
  data: FactorDataset
  savedCount: number
  savedSignatures: string[]
  onSave: (label: string, result: PortfolioResult) => SaveStatus
  onGoToCompare: () => void
}

const MODES: { id: WeightMode; label: string; hint: string }[] = [
  { id: 'optimized', label: 'Optimize weights (max Sharpe)', hint: 'Solves for the historical tangency weights across your chosen factors.' },
  { id: 'equal', label: 'Equal weight', hint: 'Splits allocation evenly across the chosen factors.' },
  { id: 'manual', label: 'Manual', hint: 'Set each factor’s weight yourself.' },
]

// Distribute 100 across n factors as whole numbers that sum to exactly 100
// (e.g. 3 → [34, 33, 33]), so the default manual weights are already valid.
function equalIntWeights(keys: FactorKey[]): Record<string, number> {
  const n = keys.length
  const base = Math.floor(100 / n)
  const remainder = 100 - base * n
  const out: Record<string, number> = {}
  keys.forEach((k, i) => {
    out[k] = base + (i < remainder ? 1 : 0)
  })
  return out
}

export function PortfolioBuilderTab({ data, savedCount, savedSignatures, onSave, onGoToCompare }: Props) {
  const [selected, setSelected] = useState<FactorKey[]>(['MKT_RF', 'SMB', 'HML'])
  const [mode, setMode] = useState<WeightMode>('optimized')
  const [manualWeights, setManualWeights] = useState<Record<string, number>>({})
  const [notice, setNotice] = useState<SaveStatus | null>(null)

  // Reset manual weights to an equal split (summing to 100) whenever the factor
  // set changes, so the manual editor always starts from a valid state.
  useEffect(() => {
    setManualWeights(equalIntWeights(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.join(',')])

  function toggleFactor(key: FactorKey) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function setManualWeight(key: FactorKey, raw: number | string) {
    let v = typeof raw === 'string' ? parseInt(raw, 10) : raw
    if (Number.isNaN(v)) v = 0
    v = Math.max(-100, Math.min(100, Math.round(v)))
    setManualWeights((prev) => ({ ...prev, [key]: v }))
  }

  const manualTotal = selected.reduce((sum, k) => sum + (manualWeights[k] ?? 0), 0)

  const result = useMemo(() => {
    if (selected.length === 0) return null
    if (mode === 'manual' && manualTotal !== 100) return null
    try {
      const manual = selected.map((k) => manualWeights[k] ?? 0)
      return buildPortfolio(data, selected, mode, mode === 'manual' ? manual : undefined)
    } catch {
      return null
    }
  }, [data, selected, mode, manualWeights, manualTotal])

  const label = selected.map((k) => k.replace('_RF', '')).join(' + ')
  const atCap = savedCount >= MAX_SAVED
  const currentSig = result ? signatureOf(result) : null
  const alreadySaved = currentSig !== null && savedSignatures.includes(currentSig)

  // Clear a stale confirmation once the portfolio itself changes.
  useEffect(() => {
    setNotice(null)
  }, [currentSig])

  function handleAdd() {
    if (!result) return
    setNotice(onSave(label, result))
  }

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
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13 }}>{k.replace('_RF', '')}</span>
              <input
                type="range"
                min={-100}
                max={100}
                value={manualWeights[k] ?? 0}
                onChange={(e) => setManualWeight(k, Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  min={-100}
                  max={100}
                  value={manualWeights[k] ?? 0}
                  onChange={(e) => setManualWeight(k, e.target.value)}
                  aria-label={`${k.replace('_RF', '')} weight in percent`}
                  className="weight-input"
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Enter weights that sum to exactly 100% (type a number or drag). Negative = short that factor.
            </span>
            <span
              className="tabular"
              style={{ fontSize: 13.5, fontWeight: 700, color: manualTotal === 100 ? 'var(--good)' : 'var(--bad)' }}
            >
              Total: {manualTotal}%
            </span>
          </div>

          {manualTotal !== 100 && (
            <div
              role="alert"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--bad)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12.5,
                color: 'var(--bad)',
              }}
            >
              {manualTotal > 100
                ? `Invalid weights: the total is ${manualTotal}%, which exceeds 100%. Reduce the weights by ${manualTotal - 100}% so they sum to exactly 100%.`
                : `Invalid weights: the total is ${manualTotal}%, which is below 100%. Add ${100 - manualTotal}% more so they sum to exactly 100%.`}
            </div>
          )}
        </div>
      )}

      {selected.length === 0 && <p style={{ fontSize: 13 }}>Select at least one factor to see results.</p>}

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {alreadySaved ? (
                <button
                  type="button"
                  onClick={onGoToCompare}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid var(--good)',
                    background: 'transparent',
                    color: 'var(--good)',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  ✓ In Compare — view
                </button>
              ) : (
                <button
                  type="button"
                  disabled={atCap}
                  onClick={handleAdd}
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
              )}
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{savedCount}/{MAX_SAVED} in Compare</span>
            </div>
            {notice && <CompareNotice kind={notice} label={label} count={savedCount} onGoToCompare={onGoToCompare} />}
          </div>
        </>
      )}
    </div>
  )
}
