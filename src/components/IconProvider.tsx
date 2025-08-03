import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Theme, IconConfig, IconRegistry } from '../types';
import type { ThemeTokens } from '../theming/tokens';
import { getTokens } from '../theming/tokens';

export interface IconProviderConfig extends Omit<IconConfig, 'overrides' | 'tokens'> {
  overrides?: IconRegistry;
  tokens?: ThemeTokens;
  // New provider-level defaults
  defaultVariant?: 'filled' | 'outline';
  defaultStrokeWidth?: number | string;
}

const defaultConfig: Required<
  Pick<IconProviderConfig, 'size' | 'color' | 'theme' | 'overrides' | 'tokens'>
> & Partial<Pick<IconProviderConfig, 'defaultVariant' | 'defaultStrokeWidth'>> = {
  size: 20,
  color: 'currentColor',
  theme: 'auto' as Theme,
  overrides: {},
  tokens: getTokens('auto'),
  defaultVariant: undefined,
  defaultStrokeWidth: undefined,
};

type IconContextShape = IconProviderConfig & {
  setOverrides?: React.Dispatch<React.SetStateAction<IconRegistry>>;
};

const IconContext = createContext<IconContextShape>(defaultConfig);

export interface IconProviderProps extends IconProviderConfig {
  children: ReactNode;
}

export function IconProvider({
  children,
  size,
  color,
  theme,
  overrides,
  tokens,
  defaultVariant,
  defaultStrokeWidth,
}: IconProviderProps) {
  // Local state to allow runtime override updates; merge with incoming prop overrides
  const [localOverrides, setLocalOverrides] = useState<IconRegistry>({});
  const mergedOverrides = useMemo<IconRegistry>(
    () => ({ ...(overrides ?? {}), ...localOverrides }),
    [overrides, localOverrides]
  );

  const resolvedTokens = useMemo<ThemeTokens>(() => {
    const base = getTokens(theme ?? 'auto');
    // Shallow merge: provided tokens override base
    return { ...base, ...(tokens ?? {}) } as ThemeTokens;
  }, [theme, tokens]);

  const value = useMemo<IconContextShape>(
    () => ({
      ...defaultConfig,
      ...(size !== undefined ? { size } : null),
      ...(color !== undefined ? { color } : null),
      ...(theme !== undefined ? { theme } : null),
      overrides: mergedOverrides,
      tokens: resolvedTokens,
      setOverrides: setLocalOverrides,
      ...(defaultVariant !== undefined ? { defaultVariant } : null),
      ...(defaultStrokeWidth !== undefined ? { defaultStrokeWidth } : null),
    }),
    [size, color, theme, mergedOverrides, resolvedTokens, defaultVariant, defaultStrokeWidth]
  );

  return React.createElement(IconContext.Provider, { value }, children);
}

export function useIconConfig(): IconProviderConfig {
  const ctx = useContext(IconContext);
  return ctx ?? defaultConfig;
}

export function useIconTokens(): ThemeTokens {
  const ctx = useContext(IconContext);
  return (ctx?.tokens as ThemeTokens) ?? defaultConfig.tokens;
}

// Helper reads from context; safe during render in React
export function getIconOverride(name: string) {
  const ctx = useContext(IconContext);
  return (ctx?.overrides ?? defaultConfig.overrides)[name];
}

// Setter hook to mutate overrides at runtime
export function useSetIconOverrides(): (updater: (prev: IconRegistry) => IconRegistry) => void {
  const ctx = useContext(IconContext);
  const set = ctx?.setOverrides;
  // Provide a stable no-op fallback if context not available
  return useCallback(
    (updater: (prev: IconRegistry) => IconRegistry) => {
      if (set) {
        set((prev: IconRegistry) => updater(prev));
      }
    },
    [set]
  );
}