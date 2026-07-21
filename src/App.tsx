import { useEffect, useState } from 'react'
import { BestPortfoliosTab } from './components/BestPortfoliosTab'
import { CompareTab } from './components/CompareTab'
import { FactorLibraryTab } from './components/FactorLibraryTab'
import { PortfolioBuilderTab } from './components/PortfolioBuilderTab'
import { loadFactorData, type FactorDataset } from './lib/data'
import { PORTFOLIO_COLORS } from './lib/factors'
import type { PortfolioResult } from './lib/portfolio'
import { MAX_SAVED, nextId, signatureOf, type SaveStatus, type SavedPortfolio } from './lib/saved'

type Tab = 'library' | 'builder' | 'best' | 'compare'

const TABS: { id: Tab; label: string }[] = [
  { id: 'library', label: 'Factor Library' },
  { id: 'builder', label: 'Portfolio Builder' },
  { id: 'best', label: 'Best Portfolios' },
  { id: 'compare', label: 'Compare' },
]

function App() {
  const [data, setData] = useState<FactorDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('builder')
  const [saved, setSaved] = useState<SavedPortfolio[]>([])

  useEffect(() => {
    loadFactorData()
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [])

  const savedSignatures = saved.map((s) => signatureOf(s.result))

  function addSaved(label: string, result: PortfolioResult): SaveStatus {
    const sig = signatureOf(result)
    if (saved.some((s) => signatureOf(s.result) === sig)) return 'duplicate'
    if (saved.length >= MAX_SAVED) return 'full'
    const color = PORTFOLIO_COLORS[saved.length % PORTFOLIO_COLORS.length]
    setSaved((prev) => [...prev, { id: nextId(), label, color, result }])
    return 'added'
  }

  function removeSaved(id: string) {
    setSaved((prev) => prev.filter((p) => p.id !== id))
  }

  const goToCompare = () => setTab('compare')

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px 64px' }}>
      <header style={{ padding: '28px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
          Multi-Factor Return Model
        </div>
        <h1 style={{ fontSize: 26 }}>Factor Portfolio Optimizer</h1>
        <p style={{ fontSize: 13.5, marginTop: 6, maxWidth: 720 }}>
          Combine CAPM, Fama-French, and Carhart factors — Market, Size, Value, Momentum, Profitability, and Investment —
          and find the weighting that would have produced the best historical risk-adjusted return, using monthly Indian
          equity factor data from{' '}
          <a href="https://quantfin-scdlds.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            SCDLDS, Ashoka University
          </a>
          .
        </p>

        <nav style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: 'none',
                background: tab === t.id ? 'var(--accent)' : 'var(--surface-1)',
                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 600,
                position: 'relative',
              }}
            >
              {t.label}
              {t.id === 'compare' && saved.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: 11,
                  }}
                >
                  {saved.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {error && <p style={{ color: 'var(--bad)' }}>Failed to load factor data: {error}</p>}
        {!error && !data && <p>Loading factor data…</p>}
        {data && tab === 'library' && <FactorLibraryTab data={data} />}
        {data && tab === 'builder' && (
          <PortfolioBuilderTab
            data={data}
            savedCount={saved.length}
            savedSignatures={savedSignatures}
            onSave={addSaved}
            onGoToCompare={goToCompare}
          />
        )}
        {data && tab === 'best' && (
          <BestPortfoliosTab
            data={data}
            savedCount={saved.length}
            savedSignatures={savedSignatures}
            onSave={addSaved}
            onGoToCompare={goToCompare}
          />
        )}
        {data && tab === 'compare' && (
          <CompareTab data={data} saved={saved} onRemove={removeSaved} onClear={() => setSaved([])} />
        )}
      </main>
    </div>
  )
}

export default App
