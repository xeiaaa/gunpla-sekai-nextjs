'use client';

import { useEffect } from 'react';

// BProgress automatically handles route changes in Next.js
// This hook provides additional programmatic control if needed

export function useProgress() {
  useEffect(() => {
    // BProgress is automatically initialized when the component mounts
    // and handles Next.js route changes automatically
  }, []);

  // You can extend this hook to provide manual control methods
  // if you need to show progress for custom operations
  const start = () => {
    if (typeof window !== 'undefined' && window.NProgress) {
      window.NProgress.start();
    }
  };

  const set = (n: number) => {
    if (typeof window !== 'undefined' && window.NProgress) {
      window.NProgress.set(n);
    }
  };

  const inc = (n?: number) => {
    if (typeof window !== 'undefined' && window.NProgress) {
      window.NProgress.inc(n);
    }
  };

  const done = () => {
    if (typeof window !== 'undefined' && window.NProgress) {
      window.NProgress.done();
    }
  };

  return {
    start,
    set,
    inc,
    done,
  };
}

// Extend the Window interface to include NProgress
declare global {
  interface Window {
    NProgress?: {
      start: () => void;
      set: (n: number) => void;
      inc: (n?: number) => void;
      done: () => void;
    };
  }
}
