import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    // Put a clean, library-facing types entry next to JS entry
    // and generate a separate, minimal .d.ts map for subpaths.
    resolve: true,
    entry: {
      index: 'src/index.ts',
    },
  },
  // Generate declaration maps for improved DX
  sourcemap: true,
  splitting: true,
  clean: true,
  minify: false,
  target: 'es2020',
  define: {
    // Avoid requiring Node typings at typecheck time by reading at runtime in tsup
    'process.env.NODE_ENV': JSON.stringify((globalThis as any)?.process?.env?.NODE_ENV || 'production'),
  },
  external: ['react'],
  // Use tsx to execute TS postbuild script (avoids ERR_UNKNOWN_FILE_EXTENSION)
  onSuccess: 'tsx scripts/postbuild-dts.ts',
});