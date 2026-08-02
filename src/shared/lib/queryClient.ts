import { QueryClient } from '@tanstack/react-query'

/**
 * FPRD-14: Production-ready QueryClient
 * - 1 retry with capped exponential backoff
 * - 5-min staleTime — prevents duplicate fetches across navigation
 * - 10-min gcTime — keeps data in memory between page visits
 * - refetchOnWindowFocus: false globally — individual queries opt in where needed
 * - keepPreviousData equivalent via placeholderData in query hooks
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes
      // Disable window-focus refetch globally — prevents flooding the backend
      // on every browser tab switch. Opt-in per query where real-time is needed.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        console.error('[Mutation error]', error)
      },
    },
  },
})
