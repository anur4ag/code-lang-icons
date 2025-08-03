import type { IconKey, ResolveInput } from '../types';
import { getMappings } from '../mapping';

function normLower(s: string): string {
  return s.trim().toLowerCase();
}

function stripDot(ext: string): string {
  return ext.replace(/^\./, '').toLowerCase();
}

function filenameParts(name: string) {
  const base = normLower(name);
  const isDotfile = base.startsWith('.');
  // handle known compound patterns: .d.ts, .test.tsx, .spec.js etc.
  const segments = base.split('.');
  let ext = '';
  if (segments.length > 1) {
    // prefer last extension
    ext = segments.pop() || '';
    const prev = segments[segments.length - 1] || '';
    // handle d.ts
    if (prev === 'd') {
      ext = `d.${ext}`;
      segments.pop();
    }
    // handle test/spec
    if (prev === 'test' || prev === 'spec') {
      ext = `${prev}.${ext}`;
      segments.pop();
    }
  }
  const stem = segments.join('.');
  return { base, isDotfile, ext, stem };
}

export function getIconKeyByIdentifier(id: string): IconKey {
  if (!id) return 'default';
  const mappings = getMappings();
  const norm = normLower(id);
  const fromAlias = mappings.aliases[norm];
  const key =
    mappings.identifiers[norm] ??
    (fromAlias ? mappings.identifiers[fromAlias] ?? fromAlias : undefined) ??
    fromAlias;
  return key ?? 'default';
}

export function getIconKeyByFileName(fileName: string): IconKey {
  if (!fileName) return 'default';
  const mappings = getMappings();
  const { base, isDotfile, stem, ext } = filenameParts(fileName);

  // Known config filenames from mapping first (case-insensitive)
  const filenames = mappings.filenames;
  const lowerBase = base.toLowerCase();
  const lowerStem = stem.toLowerCase();
  const byExact =
    filenames[base] ??
    filenames[stem] ??
    filenames[lowerBase] ??
    filenames[lowerStem];
  if (byExact) return byExact;

  // Special-case Dockerfile/Makefile (case-insensitive)
  if (lowerBase === 'dockerfile') return mappings.identifiers['docker'] ?? 'docker';
  if (lowerBase === 'makefile') return mappings.identifiers['make'] ?? 'make';

  // Dotfiles: check direct map for dotfiles
  if (isDotfile) {
    const dot = filenames[base] ?? filenames[lowerBase] ?? filenames[`${lowerBase}.json`];
    if (dot) return dot;
  }

  // Prefer compound extension like .d.ts over plain .ts
  // Check compound first
  const compound = ext ? `${ext}` : '';
  if (compound) {
    const compKey = getIconKeyByExtension(compound);
    if (compKey !== 'default') return compKey;
    // If compound like test.tsx or spec.js etc, fall through to last segment
    const last = compound.split('.').pop()!;
    const lastKey = getIconKeyByExtension(last);
    if (lastKey !== 'default') return lastKey;
  }

  // Fallback to extension-based, using the base if no ext
  const byExt = getIconKeyByExtension(ext || base);
  if (byExt !== 'default') return byExt;

  return 'default';
}

export function getIconKeyByExtension(ext: string): IconKey {
  if (!ext) return 'default';
  const e = stripDot(ext);
  const mappings = getMappings();
  // normalize via aliases when present
  const alias = mappings.aliases[e];
  const norm = alias ?? e;
  return mappings.extensions[norm] ?? mappings.extensions[e] ?? 'default';
}

export function resolveIconKey(input: ResolveInput): IconKey {
  const id = input.identifier ? getIconKeyByIdentifier(input.identifier) : undefined;
  if (id && id !== 'default') return id;

  // Accept legacy 'filename' too for backward compat
  const name = (input as any).filename ?? input.fileName;
  const byFile = name ? getIconKeyByFileName(name) : undefined;
  if (byFile && byFile !== 'default') return byFile;

  const byExt = input.extension ? getIconKeyByExtension(input.extension) : undefined;
  return byExt ?? 'default';
}