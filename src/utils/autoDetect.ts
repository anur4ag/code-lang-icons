/**
 * Auto-detection helpers for resolving icon keys from various inputs.
 *
 * These utilities are pure and tree-shakable.
 */

import { resolveIconKey } from '../utils/resolve';

export interface AutoDetectInput {
  /**
   * Full or relative path to a file. Both POSIX (/) and Windows (\) separators are supported.
   */
  path?: string;
  /**
   * Bare file name. If not provided, it will be derived from `path` when possible.
   */
  fileName?: string;
  /**
   * Explicit identifier to force a particular icon key resolution (e.g., framework/library name).
   * If provided, it will be preferred during resolution.
   */
  identifier?: string;
}

/**
 * Extract the extension from a file name.
 *
 * - Handles compound extensions such as:
 *   - .d.ts, .test.tsx, .spec.js, .stories.tsx, .config.js
 * - Handles dotfiles:
 *   - .gitignore, .npmrc (returns token after the dot, e.g. "gitignore", "npmrc")
 *   - .eslintrc.json (returns "json")
 *
 * Returns the extension WITHOUT the leading dot (e.g., "tsx"). If none is found, returns undefined.
 */
export function extractExtension(fileName: string): string | undefined {
  if (!fileName) return undefined;

  // Dotfile handling e.g., ".gitignore", ".eslintrc.json"
  if (fileName.startsWith('.')) {
    const withoutDot = fileName.slice(1);
    if (!withoutDot) return undefined;
    const parts = withoutDot.split('.');
    if (parts.length > 1) {
      // Prefer the real extension at the end: ".eslintrc.json" -> "json"
      return parts[parts.length - 1] || undefined;
    }
    // ".gitignore" -> "gitignore"
    return withoutDot || undefined;
  }

  const parts = fileName.split('.');
  if (parts.length <= 1) return undefined;

  // Consider the last two segments for compound awareness
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];

  // Known compound indicators
  const compoundPrev = new Set(['d', 'test', 'spec', 'stories', 'config']);

  if (prev && compoundPrev.has(prev)) {
    // For our mapping purposes we generally want the canonical language extension:
    // - "d.ts" -> "ts"
    // - "test.tsx" -> "tsx"
    // - "spec.js" -> "js"
    // So we return the final segment.
    return last || undefined;
  }

  // Fallback: last token
  return last || undefined;
}

/**
 * Attempts to resolve an icon key based on provided inputs.
 * Order of precedence:
 * 1) If `identifier` is provided, use it for resolution.
 * 2) If `path` is provided, derive `fileName` from it (Windows and POSIX supported).
 * 3) If `fileName` is provided, extract a best-effort extension (compound-aware).
 *
 * Returns the key from resolveIconKey which can be used to lookup an icon.
 */
export function autoDetectIcon(input: AutoDetectInput): string {
  const { path, fileName: rawFileName, identifier } = input || {};

  // Prefer identifier if provided
  if (identifier) {
    return resolveIconKey({ identifier });
  }

  // Derive filename from path if necessary; support both / and \
  let fileName = rawFileName;
  if (!fileName && typeof path === 'string') {
    const segments = path.split(/[/\\]+/).filter(Boolean);
    fileName = segments.length ? segments[segments.length - 1] : undefined;
  }

  const extension = fileName ? extractExtension(fileName) : undefined;

  return resolveIconKey({
    fileName,
    extension,
    identifier,
  });
}