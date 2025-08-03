import type { Theme } from '../types';

export interface ThemeTokens {
  foreground: string;
  muted: string;
  accent: string;
  warning: string;
  danger: string;
  success: string;
}

export const lightTokens: ThemeTokens = {
  foreground: '#1f2937', // gray-800
  muted: '#6b7280',      // gray-500
  accent: '#2563eb',     // blue-600
  warning: '#d97706',    // amber-600
  danger: '#dc2626',     // red-600
  success: '#16a34a',    // green-600
};

export const darkTokens: ThemeTokens = {
  foreground: '#e5e7eb', // gray-200
  muted: '#9ca3af',      // gray-400
  accent: '#60a5fa',     // blue-400
  warning: '#f59e0b',    // amber-500
  danger: '#f87171',     // red-400
  success: '#34d399',    // green-400
};

export function getTokens(theme: Theme | undefined): ThemeTokens {
  if (theme === 'dark') return darkTokens;
  if (theme === 'light') return lightTokens;
  // 'auto' and undefined default to light for SSR-safe baseline
  return lightTokens;
}

export type { ThemeTokens as ThemeTokensType };