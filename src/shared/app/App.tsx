import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { OfflineBanner } from '@/shared/components/feedback/OfflineBanner'
import { Toaster } from '@/shared/components/ui/toaster'
import { router } from '@/shared/routes'
import { queryClient } from '@/shared/lib/queryClient'
import { AppInitializer } from '@/shared/components/auth/AppInitializer'

/**
 * PRD-08: App root.
 * AppInitializer fetches /auth/me on every load to get the latest role from DB.
 * This ensures page refresh preserves login and stale roles are never used.
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInitializer>
          <OfflineBanner />
          <RouterProvider router={router} />
          <Toaster />
        </AppInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
