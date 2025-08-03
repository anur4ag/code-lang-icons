/* eslint-disable no-console */
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const INDEX_D_TS = join(DIST, 'index.d.ts');

/**
 * Normalize React imports/usages inside the generated .d.ts so downstream
 * tooling sees a consistent surface.
 *
 * - Collapse duplicate default/namespaced react imports into a single type import.
 * - Replace react__default.* and react.* symbol references with proper types.
 */
function normalizeReactImports(content: string): string {
  let out = content;

  // Remove "import * as react from 'react';"
  out = out.replace(/^\s*import\s+\*\s+as\s+react\s+from\s+'react';\s*$/m, '');

  // Replace "import react__default, { ... } from 'react';" with a single type import line.
  out = out.replace(
    /^\s*import\s+react__default,\s*\{\s*([^}]+)\s*\}\s+from\s+'react';\s*$/m,
    (_m, group) => {
      const names = String(group)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Ensure we include the component types we rely on
      const need = new Set([
        ...names,
        'ComponentType',
        'ForwardRefExoticComponent',
        'RefAttributes',
      ]);

      // Remove duplicates and normalize spacing
      const inner = Array.from(need).sort().join(', ');
      return `import type { ${inner} } from 'react';\n`;
    }
  );

  // Fallback: if we no longer have any react import, add a minimal one for types
  if (!/from 'react'/.test(out)) {
    out = `import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';\n${out}`;
  }

  // Replace react__default.ComponentType<T> and other react__default.* tokens
  out = out.replace(/react__default\.ComponentType</g, 'ComponentType<');
  out = out.replace(/react__default\.ForwardRefExoticComponent</g, 'ForwardRefExoticComponent<');
  out = out.replace(/react__default\.RefAttributes</g, 'RefAttributes<');

  // Replace "react." prefixed variants that sometimes appear
  out = out.replace(/\breact\.ForwardRefExoticComponent</g, 'ForwardRefExoticComponent<');
  out = out.replace(/\breact\.RefAttributes</g, 'RefAttributes<');

  // Some utility React types that might be referenced via default alias
  out = out.replace(/\breact__default\.Dispatch\b/g, 'import("react").Dispatch');
  out = out.replace(/\breact__default\.SetStateAction\b/g, 'import("react").SetStateAction');

  return out;
}

/**
 * Rename internal alias names emitted by the bundler, e.g. IconProps$1 -> IconProps.
 */
function renameInternalAliases(content: string): string {
  let out = content;
  out = out.replace(/\bIconProps\$1\b/g, 'IconProps');
  return out;
}

/**
 * Extracts icon component declarations from index.d.ts and removes them from the index content.
 * We return the pruned index content, the raw declaration lines, and the icon names.
 *
 * Matches lines like:
 *   declare const JsIcon: ForwardRefExoticComponent<Omit<IconProps, "ref"> & RefAttributes<SVGSVGElement>>;
 */
function extractIconDeclarations(content: string): {
  pruned: string;
  iconDecls: string[];
  iconNames: string[];
} {
  const lines = content.split('\n');

  const iconDecls: string[] = [];
  const iconNames: string[] = [];

  const declRegex =
    /^\s*declare\s+const\s+([A-Z][A-Za-z0-9_]*)Icon\s*:\s*ForwardRefExoticComponent<.*>;\s*$/;

  for (const line of lines) {
    const m = line.match(declRegex);
    if (m) {
      const comp = `${m[1]}Icon`;
      iconDecls.push(line);
      iconNames.push(comp);
    }
  }

  const pruned = lines.filter((l) => !declRegex.test(l)).join('\n');
  return { pruned, iconDecls, iconNames };
}

/**
 * Build the contents of a per-icon .d.ts that references IconProps from the root types.
 */
function buildIconDts(name: string, declLine: string): string {
  // Export default for each icon to support `import X from 'pkg/icons/X'`
  return `import type { IconProps } from '../index';

${declLine}
export default ${name};
`;
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Remove now-unused helper imports or duplicate type aliases.
 * This is conservative: trims redundant blank lines and collapses multiple empty lines.
 */
function tidy(content: string): string {
  // Remove multiple consecutive blank lines
  return content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim() + '\n';
}

async function run() {
  let index = await fs.readFile(INDEX_D_TS, 'utf8');

  // 1) Normalize imports and alias names
  index = normalizeReactImports(index);
  index = renameInternalAliases(index);

  // 2) Extract icon declarations to move them into dist/icons/*.d.ts
  const { pruned, iconDecls, iconNames } = extractIconDeclarations(index);
  index = pruned;

  // 3) Write per-icon declarations
  const iconsDir = join(DIST, 'icons');
  await ensureDir(iconsDir);

  for (const line of iconDecls) {
    const nameMatch = line.match(/declare\s+const\s+([A-Za-z0-9_]+)\s*:/);
    if (!nameMatch) continue;
    const compName = nameMatch[1];
    const dtsContent = buildIconDts(compName, line);
    await fs.writeFile(join(iconsDir, `${compName}.d.ts`), tidy(dtsContent), 'utf8');
  }

  // 4) Create an icons index.d.ts for convenience re-exports
  if (iconNames.length) {
    const iconsIndex =
      iconNames.map((n) => `export { default as ${n} } from './${n}';`).join('\n') + '\n';
    await fs.writeFile(join(iconsDir, 'index.d.ts'), iconsIndex, 'utf8');
  }

  // 5) Tidy and write back the pruned root index.d.ts
  index = tidy(index);
  await fs.writeFile(INDEX_D_TS, index, 'utf8');

  console.log(
    `postbuild-dts: normalized index.d.ts and moved ${iconNames.length} icon declarations into dist/icons/*.d.ts`
  );
}

run().catch((err) => {
  console.error('postbuild-dts failed:', err);
  process.exitCode = 1;
});