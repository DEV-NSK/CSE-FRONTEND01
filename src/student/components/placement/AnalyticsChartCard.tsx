import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

type ChartType = 'area' | 'bar' | 'pie' | 'line'

interface AnalyticsChartCardProps {
  title: string
  type: ChartType
  data: Record<string, unknown>[]
  dataKeys: { key: string; name: string; color?: string }[]
  xKey?: string
  height?: number
}

export function AnalyticsChartCard({
  title, type, data, dataKeys, xKey = 'name', height = 200,
}: AnalyticsChartCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={height}>
            {type === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  {dataKeys.map((dk, i) => (
                    <linearGradient key={dk.key} id={`grad-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={dk.color ?? COLORS[i % COLORS.length]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={dk.color ?? COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                {dataKeys.map((dk, i) => (
                  <Area key={dk.key} type="monotone" dataKey={dk.key} name={dk.name}
                    stroke={dk.color ?? COLORS[i % COLORS.length]} fill={`url(#grad-${dk.key})`} strokeWidth={2} />
                ))}
              </AreaChart>
            ) : type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Legend />
                {dataKeys.map((dk, i) => (
                  <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color ?? COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey={dataKeys[0]?.key ?? 'value'}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Legend />
              </PieChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Legend />
                {dataKeys.map((dk, i) => (
                  <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name}
                    stroke={dk.color ?? COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
