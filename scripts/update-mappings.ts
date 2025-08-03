/**
 * Programmatic API/CLI to extend icon registry mappings from JSON input.
 *
 * Usage:
 *   pnpm mappings:update path/to/partial.json
 *   echo '{ "extensions": { "zig": "zig" } }' | pnpm mappings:update:stdin
 *
 * The JSON shape should be Partial<RegistryMapping>.
 * Exit code: 0 on success, 1 on parse/validation errors.
 *
 * Note: avoids requiring @types/node; uses (globalThis as any).process and dynamic imports.
 */

const gproc: any = (globalThis as any).process;

async function main() {
  const [{ readFile }, pathMod, mappingApi] = await Promise.all([
    // Use Node.js specifiers via node: prefix to avoid needing @types/node
    import('node:fs/promises').then((m) => ({ readFile: m.readFile })),
    import('node:path'),
    import('../src/mapping/index.js').then(async (m) => {
      // Prefer real API when available
      const hasExtend = typeof m.extendMappings === 'function';
      const hasGetMappings = typeof m.getMappings === 'function';

      if (hasExtend && hasGetMappings) {
        return {
          extendMappings: m.extendMappings as (partial: any) => void,
          getMappings: m.getMappings as () => any,
        };
      }

      // Fallback shim if API surface differs
      const current = m as any;
      const shimExtend = (partial: any) => {
        const tables = ['extensions', 'filenames', 'identifiers', 'aliases'] as const;
        for (const t of tables) {
          if (partial?.[t] && typeof current[t] === 'object') {
            Object.assign(current[t], partial[t]);
          }
        }
      };
      const shimGet = () => ({
        extensions: { ...(current.extensions ?? {}) },
        filenames: { ...(current.filenames ?? {}) },
        identifiers: { ...(current.identifiers ?? {}) },
        aliases: { ...(current.aliases ?? {}) },
      });

      return {
        extendMappings: shimExtend,
        getMappings: shimGet,
      };
    }),
  ]);

  const argv: string[] = gproc?.argv ?? [];
  const arg = argv.slice(2)[0];

  let jsonText = '';
  try {
    if (!arg || arg === '-') {
      jsonText = await readAllStdin();
    } else {
      const filePath = (pathMod as any).resolve(arg);
      jsonText = await readFile(filePath, 'utf8');
    }
  } catch (e: any) {
    logErr(`Failed to read input: ${e?.message || e}`);
    return exit(1);
  }

  let partial: any;
  try {
    partial = JSON.parse(jsonText);
    if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
      throw new Error('Input must be a JSON object (Partial<RegistryMapping>)');
    }
  } catch (e: any) {
    logErr(`Failed to parse JSON: ${e?.message || e}`);
    return exit(1);
  }

  try {
    // Record counts before and after to compute merge summary
    const before = mappingApi.getMappings();
    mappingApi.extendMappings(partial);
    const after = mappingApi.getMappings();

    const countDiff = (a: Record<string, any>, b: Record<string, any>): number => {
      const ka = Object.keys(a);
      const kb = Object.keys(b);
      // New or changed keys in b relative to a
      let changed = 0;
      const setA = new Set(ka);
      for (const k of kb) {
        if (!setA.has(k) || a[k] !== b[k]) changed++;
      }
      return changed;
    };

    const mergedExt = countDiff(before.extensions || {}, after.extensions || {});
    const mergedFiles = countDiff(before.filenames || {}, after.filenames || {});
    const mergedIds = countDiff(before.identifiers || {}, after.identifiers || {});
    const mergedAliases = countDiff(before.aliases || {}, after.aliases || {});

    const summary =
      `Merged: extensions=${mergedExt}, filenames=${mergedFiles}, ` +
      `identifiers=${mergedIds}, aliases=${mergedAliases}`;

    logOut(summary);
    return exit(0);
  } catch (e: any) {
    logErr(`Failed to extend mappings: ${e?.message || e}`);
    return exit(1);
  }
}

async function readAllStdin(): Promise<string> {
  const proc: any = (globalThis as any).process;
  const stdin: any = proc?.stdin;
  if (!stdin || typeof stdin.setEncoding !== 'function') {
    return '';
  }
  stdin.setEncoding('utf8');
  let data = '';
  return new Promise<string>((resolve) => {
    stdin.on('data', (chunk: string) => (data += chunk));
    stdin.on('end', () => resolve(data));
    stdin.on('error', () => resolve(data));
  });
}

function logOut(msg: string) {
  const proc: any = (globalThis as any).process;
  proc?.stdout?.write?.(String(msg) + '\n');
}
function logErr(msg: string) {
  const proc: any = (globalThis as any).process;
  proc?.stderr?.write?.(String(msg) + '\n');
}
function exit(code: number): never {
  const proc: any = (globalThis as any).process;
  proc?.exit?.(code);
  // Ensure type narrowing for TS
  throw Object.assign(new Error('Process exited'), { code });
}

main();