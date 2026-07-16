import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Management</h1>
        <p className="text-slate-500 mt-1">Manage learning content, roadmaps, and resources.</p>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Learning Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
