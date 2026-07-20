import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonth } from '../lib/format'

export interface ChartSeries {
  id: string
  label: string
  color: string
  growth: number[]
}

interface Props {
  months: string[]
  series: ChartSeries[]
  height?: number
}

interface TooltipPayloadItem {
  dataKey: string
  value: number
  color: string
  name: string
}

function GrowthTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: 'var(--shadow)',
        fontSize: 12,
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label ? formatMonth(label) : ''}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span className="tabular">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export function GrowthChart({ months, series, height = 340 }: Props) {
  const data = months.map((month, i) => {
    const row: Record<string, string | number> = { month }
    series.forEach((s) => {
      row[s.id] = s.growth[i]
    })
    return row
  })

  const tickInterval = Math.max(1, Math.floor(months.length / 7))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          interval={tickInterval}
          tickFormatter={formatMonth}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          stroke="var(--border-strong)"
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          stroke="var(--border-strong)"
          width={52}
        />
        <Tooltip content={<GrowthTooltip />} />
        {series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 13 }}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
          />
        )}
        {series.map((s) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.id}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
