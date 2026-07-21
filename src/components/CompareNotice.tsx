import type { SaveStatus } from '../lib/saved'

interface Props {
  kind: SaveStatus
  label: string
  count: number
  onGoToCompare: () => void
}

/** Inline confirmation shown after an "Add to Compare" action so the user can see
 * that it worked and jump straight to the Compare tab. */
export function CompareNotice({ kind, label, count, onGoToCompare }: Props) {
  const accent = kind === 'added' ? 'var(--good)' : kind === 'full' ? 'var(--bad)' : 'var(--text-muted)'
  const icon = kind === 'added' ? '✓' : kind === 'full' ? '!' : 'ℹ'
  const text =
    kind === 'added'
      ? `Added “${label}” to Compare — you now have ${count} saved.`
      : kind === 'duplicate'
        ? `“${label}” is already in Compare (${count} saved), so it wasn’t added again.`
        : `Compare is full (${count}/5). Remove one in the Compare tab to add another.`

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        background: 'var(--surface-1)',
        border: `1px solid ${accent}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
      }}
    >
      <span style={{ color: accent, fontWeight: 700 }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
      <button
        type="button"
        onClick={onGoToCompare}
        style={{
          marginLeft: 'auto',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: 6,
          padding: '5px 12px',
          cursor: 'pointer',
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        Open Compare tab →
      </button>
    </div>
  )
}
