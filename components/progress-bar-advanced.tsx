'use client';

import { ProgressProvider } from '@bprogress/next/app';

interface ProgressBarAdvancedProps {
  children: React.ReactNode;
  color?: string;
  height?: string;
  showSpinner?: boolean;
  shallowRouting?: boolean;
}

export function ProgressBarAdvanced({
  children,
  color = '#3b82f6',
  height = '3px',
  showSpinner = false,
  shallowRouting = true,
}: ProgressBarAdvancedProps) {
  return (
    <ProgressProvider
      height={height}
      color={color}
      options={{ showSpinner }}
      shallowRouting={shallowRouting}
    >
      {children}
    </ProgressProvider>
  );
}
