'use client';

import { ProgressProvider } from '@bprogress/next/app';

interface ProgressBarProps {
  children: React.ReactNode;
}

export function ProgressBar({ children }: ProgressBarProps) {
  return (
    <ProgressProvider
      height="2px"
      color="#2256ad"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
