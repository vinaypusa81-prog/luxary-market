'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * AuthProvider — wraps NextAuth SessionProvider for global auth context.
 * Re-fetches session on window focus for security.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}
