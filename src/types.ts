import type React from 'react';
import type { IconProps as _IconProps, IconSize } from './icons/_base';
import type { ThemeTokens } from './theming/tokens';

export type Theme = 'light' | 'dark' | 'auto';

// Strong key typing kept open for user-land registrations
export type IconKey = string;

// Re-export IconProps type only from base (no duplication)
export type IconProps = _IconProps;

// Typed Icon component and registry
export type IconComponent = React.ComponentType<IconProps>;
export type IconRegistry = Record<IconKey, IconComponent>;

// Public config surface
export interface IconConfig {
  size?: IconSize;
  color?: string;
  theme?: Theme;
  overrides?: IconRegistry;
  tokens?: ThemeTokens;
}

// Resolver input
export interface ResolveInput {
  fileName?: string;
  extension?: string;
  identifier?: string;
}

// Authoring mapping shape
export interface RegistryMapping {
  extensions: Record<string, IconKey>;
  filenames: Record<string, IconKey>;
  identifiers: Record<string, IconKey>;
  aliases: Record<string, IconKey>;
}

// re-export ThemeTokens type for consumers
export type { ThemeTokens };