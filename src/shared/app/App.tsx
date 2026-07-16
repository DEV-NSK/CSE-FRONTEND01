import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { OfflineBanner } from '@/shared/components/feedback/OfflineBanner'
import { Toaster } from '@/shared/components/ui/toaster'
import { router } from '@/shared/routes'
import { queryClient } from '@/shared/lib/queryClient'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineBanner />
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
