import type React from 'react';
import type { IconProps } from '../icons/_base';

// Helper to PascalCase a key like "react", "node-js", "ts", "json5" -> "React", "NodeJs", "Ts", "Json5"
function toPascalCase(input: string): string {
  return input
    .replace(/[_\-\s]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Map-based fallback for common icons to encourage code-splitting in typical bundlers
// Note: these paths exist in generated output after running `icons:gen`.
// Provide type-safe shims so TS doesn't error before generation.
const loaders: Record<
  string,
  () => Promise<{ default: React.ComponentType<IconProps> }>
> = {
  // Use type-only import assertions to satisfy TS even if modules aren't present yet.
  js: () =>
    import('../icons/generated/JsIcon.js' as unknown as string)
      .catch(() => ({ default: (() => null) as any })),
  ts: () =>
    import('../icons/generated/TsIcon.js' as unknown as string)
      .catch(() => ({ default: (() => null) as any })),
  react: () =>
    import('../icons/generated/ReactIcon.js' as unknown as string)
      .catch(() => ({ default: (() => null) as any })),
  node: () =>
    import('../icons/generated/NodeIcon.js' as unknown as string)
      .catch(() => ({ default: (() => null) as any })),
  docker: () =>
    import('../icons/generated/DockerIcon.js' as unknown as string)
      .catch(() => ({ default: (() => null) as any })),
};

/**
 * Attempts to dynamically import an icon component for a given key.
 * 1) Try built output path assumption (dist layout): ../icons/generated/${PascalCase(key)}Icon.js
 * 2) Fallback to some known mapped dynamic imports for common keys (to enable code splitting)
 * 3) Return null so consumers can fallback to static registry/resolution
 */
export async function loadIcon(
  key: string
): Promise<React.ComponentType<IconProps> | null> {
  const base = String(key || '').trim();
  if (!base) return null;

  // Try the built output path first; many bundlers can statically analyze this pattern when pre-generated
  const pascal = toPascalCase(base);
  try {
    // Note: extension left as .js to match emitted file name in many setups; tsup will map during bundling
    const mod = await import(
      /* @vite-ignore */ `../icons/generated/${pascal}Icon.js`
    );
    const C = (mod.default ?? (mod as any)[`${pascal}Icon`]) as React.ComponentType<IconProps> | undefined;
    if (C) return C;
  } catch {
    // ignore and continue to loader map
  }

  // Loader map fallback
  const loader = loaders[base.toLowerCase()];
  if (loader) {
    try {
      const mod = await loader();
      return (mod && mod.default) || null;
    } catch {
      // ignore and fall through to null
    }
  }

  // Not available for dynamic import; let consumer fallback to static registry
  return null;
}

export type { IconProps } from '../icons/_base';