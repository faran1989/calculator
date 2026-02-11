import React from 'react';
import { vi } from 'vitest';

// ---- Next.js module mocks ----
// We only unit-test pure functions exported from the page module.
// However importing the page pulls some Next-specific modules, so we mock them.

vi.mock('next/head', () => {
  return {
    default: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

vi.mock('next/font/google', () => {
  return {
    Vazirmatn: () => ({ className: '' }),
  };
});

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/home-buy',
    useRouter: () => ({
      replace: vi.fn(),
      push: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
  };
});
