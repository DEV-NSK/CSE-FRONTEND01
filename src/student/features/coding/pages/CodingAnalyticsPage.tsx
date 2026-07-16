import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend, AreaChart, Area,
} from 'recharts'
import {
  Target, Flame, Award, TrendingUp, Code2, CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { AnalyticsSkeleton } from '@/student/components/coding/CodingSkeletons'
import { AnalyticsCard } from '@/student/components/coding/AnalyticsCard'
import { useCodingAnalytics, LANGUAGE_LABELS } from '@/shared/hooks/useCoding'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/utils'

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
]

export function CodingAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useCodingAnalytics()
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  const axisColor = isDark ? '#6b7280' : '#9ca3af'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }
    : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load analytics"
        message="Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading) return <AnalyticsSkeleton />

  const stats = data?.stats
  const diffDistribution = data?.difficultyDistribution ?? []
  const weeklyActivity = data?.weeklyActivity ?? []
  const submissionTrend = data?.submissionTrend ?? []
  const languageUsage = data?.languageUsage ?? []

  // Prepare difficulty data for chart
  const diffChartData = diffDistribution.map((d) => ({
    name: d.difficulty.charAt(0).toUpperCase() + d.difficulty.slice(1),
    solved: d.solved,
    total: d.total,
    color: DIFFICULTY_COLORS[d.difficulty],
  }))

  // Language chart data
  const langChartData = languageUsage.map((l) => ({
    name: LANGUAGE_LABELS[l.language] ?? l.language,
    count: l.count,
    percentage: l.percentage,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Analytics"
        description="Track your coding performance and growth."
        breadcrumbs={[{ label: 'Coding', href: '/dashboard/coding' }, { label: 'Analytics' }]}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Total Solved"
          value={stats?.totalSolved ?? 0}
          icon={Target}
          iconColor="text-green-500"
          description={`${stats?.easySolved ?? 0}E · ${stats?.mediumSolved ?? 0}M · ${stats?.hardSolved ?? 0}H`}
        />
        <AnalyticsCard
          label="Acceptance Rate"
          value={`${stats?.acceptanceRate?.toFixed(1) ?? 0}%`}
          icon={TrendingUp}
          iconColor="text-blue-500"
          description={`${stats?.acceptedSubmissions ?? 0} / ${stats?.totalSubmissions ?? 0} submissions`}
        />
        <AnalyticsCard
          label="Current Streak"
          value={stats?.currentStreak ?? 0}
          suffix="days"
          icon={Flame}
          iconColor="text-orange-500"
        />
        <AnalyticsCard
          label="Longest Streak"
          value={stats?.longestStreak ?? 0}
          suffix="days"
          icon={Award}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Problems Solved by Difficulty */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              Problems Solved by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diffChartData.length === 0 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={diffChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
                  <YAxis tick={{ fontSize: 12, fill: axisColor }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }} />
                  <Bar dataKey="solved" name="Solved" radius={[4, 4, 0, 0]}>
                    {diffChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="total" name="Total" fill={isDark ? '#374151' : '#e5e7eb'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 2. Weekly Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyActivity.length === 0 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={weeklyActivity.slice(-14)}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: axisColor }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12, fill: axisColor }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(val) => new Date(val as string).toLocaleDateString()}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorSubmissions)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    name="Solved"
                    stroke="#22c55e"
                    fill="url(#colorSolved)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 3. Submission Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Submission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionTrend.length === 0 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={submissionTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} />
                  <YAxis tick={{ fontSize: 12, fill: axisColor }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={isDark ? '#6b7280' : '#9ca3af'}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="accepted"
                    name="Accepted"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 4. Favorite Language */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4 text-purple-500" aria-hidden="true" />
              Language Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {langChartData.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={langChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {langChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {langChartData.map((lang, i) => (
                    <div key={lang.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="text-xs text-foreground flex-1 truncate">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">{lang.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Acceptance Rate over time */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" aria-hidden="true" />
              Acceptance Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionTrend.length === 0 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={submissionTrend.map((d) => ({
                    ...d,
                    rate: d.total > 0 ? parseFloat(((d.accepted / d.total) * 100).toFixed(1)) : 0,
                  }))}
                  margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor }} />
                  <YAxis tick={{ fontSize: 12, fill: axisColor }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val) => [`${val}%`, 'Acceptance Rate']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    name="Acceptance Rate"
                    stroke="#22c55e"
                    fill="url(#colorRate)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChartEmpty() {
  return (
    <div className="flex items-center justify-center h-[220px] text-muted-foreground">
      <div className="text-center">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">No data yet. Start solving!</p>
      </div>
    </div>
  )
}
