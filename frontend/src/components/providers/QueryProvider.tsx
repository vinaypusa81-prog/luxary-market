'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * QueryProvider — wraps TanStack Query for global server state management.
 * Creates a stable QueryClient instance per render to avoid server/client mismatch.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes by default
            staleTime: 1000 * 60 * 5,
            // Keep unused data for 10 minutes
            gcTime: 1000 * 60 * 10,
            // Retry failed requests once
            retry: 1,
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
