import { FACTOR_DEFS, type FactorKey } from '../lib/factors'

interface Props {
  selected: FactorKey[]
  onToggle: (key: FactorKey) => void
}

export function FactorChips({ selected, onToggle }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {FACTOR_DEFS.map((f) => {
        const active = selected.includes(f.key)
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onToggle(f.key)}
            title={f.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              border: `1px solid ${active ? f.color : 'var(--border-strong)'}`,
              background: active ? f.color : 'transparent',
              color: active ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: active ? '#fff' : f.color,
                display: 'inline-block',
              }}
            />
            {f.label}
            <span style={{ opacity: 0.75, fontWeight: 400 }}>({f.short})</span>
          </button>
        )
      })}
    </div>
  )
}
