import { BarChart3, Download, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { useAdminReports, useGenerateReport } from '@/shared/hooks/useAdmin'
import { useToast } from '@/shared/hooks/useToast'
import { formatDate } from '@/shared/lib/utils'

const REPORT_TYPES = ['user_activity', 'placement_summary', 'coding_stats', 'learning_progress', 'platform_overview']

export function AdminReportsPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useAdminReports()
  const generate = useGenerateReport()
  const { toast } = useToast()

  if (user?.role !== 'admin') return <Navigate to="/403" replace />

  const handleGenerate = async (type: string) => {
    try {
      await generate.mutateAsync(type)
      toast({ title: 'Report generated', description: `${type.replace('_', ' ')} report is ready.` })
    } catch { toast({ title: 'Error', description: 'Could not generate report.', variant: 'destructive' }) }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Generate and view platform reports"
        breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Reports' }]}
      />

      {/* Generate Report */}
      <Card>
        <CardHeader><CardTitle className="text-base">Generate New Report</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((type) => (
              <Button key={type} variant="outline" size="sm" className="gap-1.5 capitalize"
                onClick={() => handleGenerate(type)} loading={generate.isPending}>
                <Plus className="h-3.5 w-3.5" />{type.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Generated Reports</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState icon={<BarChart3 className="h-12 w-12" />} title="No reports yet" description="Generate your first report above." />
        ) : (
          <div className="space-y-3">
            {data.data.map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm capitalize">{report.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">Generated {formatDate(report.createdAt)} by {report.generatedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-xs">Ready</Badge>
                      <Button variant="ghost" size="icon-sm" aria-label="Download report">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
