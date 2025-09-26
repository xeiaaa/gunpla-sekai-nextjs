"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 60 * 1000, // 1 hour - kits and filters remain fresh
            gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep data locally for a day
            refetchOnWindowFocus: false, // no refetch when focusing tab
            refetchOnReconnect: true, // refetch only if user was offline
            // Prevent hydration mismatches by not retrying failed queries immediately
            retry: (failureCount, error) => {
              // Don't retry on client-side hydration
              if (error?.message?.includes("CancelledError")) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  // Ensure we're on the client side before enabling persistence
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    })
  );

  // Use regular QueryClientProvider during SSR, PersistQueryClientProvider on client
  if (!isClient) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            try {
              const queryKey = query.queryKey;
              if (!Array.isArray(queryKey)) return false;

              // Only persist successful queries, not pending or error states
              if (query.state?.status !== "success") return false;

              // Only persist kits and filter data
              return (
                queryKey[0] === "filterData" ||
                queryKey[0] === "kits-infinite" ||
                queryKey[0] === "kits"
              );
            } catch (error) {
              // If there's any error, don't persist the query
              console.warn("Error checking query for persistence:", error);
              return false;
            }
          },
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
