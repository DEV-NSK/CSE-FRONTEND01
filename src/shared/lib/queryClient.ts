import { QueryClient } from '@tanstack/react-query'

/**
 * FPRD-11: Production-ready QueryClient
 * - 3-attempt retry with exponential backoff (Module 8)
 * - 2-min staleTime to minimise redundant requests
 * - 10-min gcTime keeps data in cache between navigations
 * - refetchOnWindowFocus: true for real-time sync (Module 20)
 * - Background refetch every 5 min for dashboard (Module 12)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 8000), // 500ms, 1s, 2s, max 8s
      staleTime: 1000 * 60 * 2,        // 2 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        // Errors are handled per-mutation with toast — no global handler needed
        console.error('[Mutation error]', error)
      },
    },
  },
})
