import { useMemo, useState } from 'react'
import { evaluateAllCombinations, TOTAL_COMBINATIONS, type RankedPortfolio } from '../lib/combinations'
import type { FactorDataset } from '../lib/data'
import { FACTOR_MAP } from '../lib/factors'
import { formatRatio, formatSignedPercent } from '../lib/format'
import { MAX_SAVED, signatureOf, type SaveStatus } from '../lib/saved'
import type { PortfolioResult } from '../lib/portfolio'
import { CompareNotice } from './CompareNotice'

interface Props {
  data: FactorDataset
  savedCount: number
  savedSignatures: string[]
  onSave: (label: string, result: PortfolioResult) => SaveStatus
  onGoToCompare: () => void
}

function FactorTags({ p }: { p: RankedPortfolio }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {p.factors.map((f) => (
        <span
          key={f}
          style={{
            fontSize: 11,
            padding: '2px 7px',
            borderRadius: 999,
            background: FACTOR_MAP[f].color,
            color: '#fff',
            fontWeight: 500,
          }}
        >
          {FACTOR_MAP[f].short}
        </span>
      ))}
    </div>
  )
}

export function BestPortfoliosTab({ data, savedCount, savedSignatures, onSave, onGoToCompare }: Props) {
  const ranked = useMemo(() => evaluateAllCombinations(data), [data])
  const [showAll, setShowAll] = useState(false)
  const [notice, setNotice] = useState<{ status: SaveStatus; label: string } | null>(null)
  const atCap = savedCount >= MAX_SAVED

  const top5 = ranked.slice(0, 5)
  const rest = ranked.slice(5)

  const labelFor = (p: RankedPortfolio) => `#${p.rank}: ${p.factors.map((f) => FACTOR_MAP[f].short).join('+')}`

  function handleAdd(p: RankedPortfolio) {
    const label = labelFor(p)
    setNotice({ status: onSave(label, p), label })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Best 5 portfolios</h2>
        <p style={{ fontSize: 13 }}>
          Every non-empty combination of the six factors ({TOTAL_COMBINATIONS} in total) was evaluated with historically
          optimized (max-Sharpe) weights. These are the top 5 overall, ranked by Sharpe ratio, regardless of how many
          factors each one uses.
        </p>
      </div>

      {notice && (
        <CompareNotice kind={notice.status} label={notice.label} count={savedCount} onGoToCompare={onGoToCompare} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
        {top5.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}
              >
                Portfolio {p.rank}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.factors.length} factor{p.factors.length > 1 ? 's' : ''}</span>
            </div>
            <FactorTags p={p} />
            <div className="tabular" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ann. return</span>
                <strong style={{ color: p.annReturn >= 0 ? 'var(--good)' : 'var(--bad)' }}>{formatSignedPercent(p.annReturn)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ann. volatility</span>
                <strong>{formatSignedPercent(p.annVol).replace('+', '')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sharpe</span>
                <strong>{formatRatio(p.sharpe)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max drawdown</span>
                <strong style={{ color: 'var(--bad)' }}>{formatSignedPercent(p.maxDrawdown).replace('+', '')}</strong>
              </div>
            </div>
            {savedSignatures.includes(signatureOf(p)) ? (
              <button
                type="button"
                onClick={onGoToCompare}
                style={{
                  marginTop: 4,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--good)',
                  background: 'transparent',
                  color: 'var(--good)',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                ✓ In Compare — view
              </button>
            ) : (
              <button
                type="button"
                disabled={atCap}
                onClick={() => handleAdd(p)}
                style={{
                  marginTop: 4,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: atCap ? 'var(--border-strong)' : 'var(--accent)',
                  color: '#fff',
                  cursor: atCap ? 'not-allowed' : 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {atCap ? 'Compare full' : '+ Add to Compare'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: 13,
            padding: 0,
          }}
        >
          {showAll ? 'Hide' : `Show all ${TOTAL_COMBINATIONS} combinations`} {showAll ? '▲' : '▼'}
        </button>
      </div>

      {showAll && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: 'var(--surface-1)', textAlign: 'left' }}>
                {['Rank', 'Factors', '# ', 'Ann. return', 'Ann. vol', 'Sharpe', 'Max DD', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rest.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 12px' }}>{p.rank}</td>
                  <td style={{ padding: '6px 12px' }}>
                    <FactorTags p={p} />
                  </td>
                  <td className="tabular" style={{ padding: '6px 12px' }}>{p.factors.length}</td>
                  <td className="tabular" style={{ padding: '6px 12px', color: p.annReturn >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                    {formatSignedPercent(p.annReturn)}
                  </td>
                  <td className="tabular" style={{ padding: '6px 12px' }}>{formatSignedPercent(p.annVol).replace('+', '')}</td>
                  <td className="tabular" style={{ padding: '6px 12px' }}>{formatRatio(p.sharpe)}</td>
                  <td className="tabular" style={{ padding: '6px 12px', color: 'var(--bad)' }}>{formatSignedPercent(p.maxDrawdown).replace('+', '')}</td>
                  <td style={{ padding: '6px 12px' }}>
                    {savedSignatures.includes(signatureOf(p)) ? (
                      <button
                        type="button"
                        onClick={onGoToCompare}
                        style={{
                          border: '1px solid var(--good)',
                          background: 'transparent',
                          color: 'var(--good)',
                          borderRadius: 6,
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontSize: 11.5,
                        }}
                      >
                        ✓ In
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={atCap}
                        onClick={() => handleAdd(p)}
                        style={{
                          border: '1px solid var(--border-strong)',
                          background: 'transparent',
                          color: atCap ? 'var(--text-muted)' : 'var(--text-primary)',
                          borderRadius: 6,
                          padding: '3px 8px',
                          cursor: atCap ? 'not-allowed' : 'pointer',
                          fontSize: 11.5,
                        }}
                      >
                        Add
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
