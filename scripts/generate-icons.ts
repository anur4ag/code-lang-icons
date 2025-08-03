/* eslint-disable no-console */
// Node built-ins via globalThis-safe access to avoid requiring @types/node at typecheck time.
import { promises as fs } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

/**
 * Utilities
 */
const gproc: any = (globalThis as any)?.process;
const cwd = (gproc?.cwd && gproc.cwd()) || '';
const SRC_DIR = join(cwd, 'assets', 'svg');
const OUT_DIR = join(cwd, 'src', 'icons', 'generated');

function toPascalCaseIcon(name: string): string {
  const cleaned = name.replace(/\.[^.]+$/, '');
  return cleaned
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Icon';
}

function sanitizeSvg(svg: string) {
  // Remove title/desc nodes
  svg = svg
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[^>]*>[\s\S]*?<\/desc>/gi, '');

  // Extract viewBox (fallback to 0 0 24 24 if missing)
  const viewBoxMatch = svg.match(/viewBox\s*=\s*"([^"]+)"/i) || svg.match(/viewBox\s*=\s*'([^']+)'/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // Remove width/height/fill/stroke on svg and its children except path data etc.
  // We keep structural attributes; strip presentational attrs that conflict with BaseIcon props.
  const STRIP_ATTRS = /\s(?:width|height|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|color)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;

  // Get inner content of the root svg
  const inner = (() => {
    const openTagEnd = svg.indexOf('>');
    const closeTagStart = svg.lastIndexOf('</svg>');
    if (openTagEnd === -1 || closeTagStart === -1) return '';
    return svg.slice(openTagEnd + 1, closeTagStart);
  })();

  // Strip attributes in inner content nodes
  const cleanedInner = inner.replace(STRIP_ATTRS, '');

  return {
    viewBox,
    inner: cleanedInner.trim(),
  };
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

function componentTsx(name: string, viewBox: string, inner: string) {
  // We rely on BaseIcon to render title/size/color/role etc. The generated component just injects sanitized SVG nodes.
  return [
    "import React, { forwardRef } from 'react';",
    "import { BaseIcon, type IconProps } from '../_base';",
    '',
    `export const ${name} = forwardRef<SVGSVGElement, IconProps>(function ${name}(props, ref) {`,
    '  return (',
    `    <BaseIcon ref={ref} viewBox="${viewBox}" {...props}>`,
    indentInner(inner, 6),
    '    </BaseIcon>',
    '  );',
    '});',
    `${name}.displayName = '${name}';`,
    `export default ${name};`,
    '',
  ].join('\n');
}

function indentInner(inner: string, spaces: number) {
  const pad = ' '.repeat(spaces);
  if (!inner) return '';
  return inner
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => `${pad}${l}`)
    .join('\n');
}

async function* iterSvgFiles(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* iterSvgFiles(p);
    } else if (ent.isFile() && /\.svg$/i.test(ent.name)) {
      yield p;
    }
  }
}

async function generate() {
  const indexExports: string[] = [];
  const registryEntries: string[] = [];

  await ensureDir(OUT_DIR);

  let count = 0;
  for await (const file of iterSvgFiles(SRC_DIR)) {
    const base = basename(file); // e.g., js.svg, react.svg
    const key = base.replace(/\.svg$/i, ''); // registry key: original filename without extension
    const compName = toPascalCaseIcon(key);

    const raw = await fs.readFile(file, 'utf8');
    const { viewBox, inner } = sanitizeSvg(raw);

    const outFile = join(OUT_DIR, `${compName}.tsx`);
    await ensureDir(dirname(outFile));
    await fs.writeFile(outFile, componentTsx(compName, viewBox, inner), 'utf8');

    indexExports.push(`export { default as ${compName} } from './${compName}';\nexport * from './${compName}';`);
    registryEntries.push(`  '${key}': ${compName},`);

    count++;
  }

  // Write index.ts
  const indexPath = join(OUT_DIR, 'index.ts');
  const indexContent = `${indexExports.join('\n')}\n`;
  await fs.writeFile(indexPath, indexContent, 'utf8');

  // Write registry.ts
  const registryPath = join(OUT_DIR, 'registry.ts');
  const importLines = indexExports
    .map((line) => {
      const m = line.match(/default as (\w+)/);
      return m ? `import ${m[1]} from './${m[1]}';` : '';
    })
    .filter(Boolean)
    .join('\n');

  const registryContent = `import type { IconRegistry } from '../../types';
${importLines}

export const generatedRegistry: IconRegistry = {
${registryEntries.join('\n')}
};
export { generatedRegistry };
`;
  await fs.writeFile(registryPath, registryContent, 'utf8');

  const relOut = relative(process.cwd(), OUT_DIR);
  console.log(`Generated ${count} icons into ${relOut}`);
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  (globalThis as any).process = (globalThis as any).process ?? {};
  (globalThis as any).process.exitCode = 1;
});