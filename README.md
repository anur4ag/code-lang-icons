# code-lang-icons

TypeScript React icon library for code languages and related files. Tree-shakeable ESM with CJS compatibility.

## Install

```sh
pnpm add code-lang-icons
# peer
pnpm add react
```

## Usage

```tsx
import React from 'react';
import { CodeIcon, IconProvider, JsIcon } from 'code-lang-icons';

export default function Example() {
  return (
    <IconProvider size={20} theme="auto">
      <CodeIcon title="Code placeholder" aria-label="Code icon" />
      <JsIcon title="JavaScript" aria-label="JavaScript icon" />
    </IconProvider>
  );
}
```

Tree-shaking: import only what you need, e.g. `import { JsIcon } from 'code-lang-icons/icons'`.

## Auto-detection helper

Use the resolver to derive an icon key from a path, filename, or identifier. Compound extensions and dotfiles are handled.

```ts
import { autoDetectIcon } from 'code-lang-icons';

autoDetectIcon({ path: 'src/app.test.tsx' }); // "ts"
autoDetectIcon({ fileName: 'index.d.ts' });   // "ts"
autoDetectIcon({ identifier: 'react' });      // "react"
```

You can pass the returned key to either the dynamic loader or the static `<CodeIcon>` resolver.

## Theming and tokens

Icon coloring defaults to design tokens derived from the provider theme. On SSR and without configuration, token resolution defaults to `auto` (light tokens by default) and allows client CSS to override. Provide your own tokens or theme via `IconProvider`.

```tsx
import { IconProvider } from 'code-lang-icons';

function App({ children }) {
  return (
    <IconProvider
      theme="auto"        // 'light' | 'dark' | 'auto'
      tokens={{
        foreground: '#1f2937',
        muted: '#9ca3af',
        accent: '#3b82f6',
      }}
    >
      {children}
    </IconProvider>
  );
}
```

Base icons automatically use tokens when no `color` prop is provided. When a color is specified, it takes precedence.

## Customization

Per-icon props:

- `size`: number | string. Numbers are px. Example: `size={16}` or `size="1.25rem"`.
- `color`: string. Overrides token-based color if provided.
- `strokeWidth`: number | string. Strokes use `vector-effect="non-scaling-stroke"` to remain crisp when scaled.
- `variant`: 'filled' | 'outline' (via `data-variant` passthrough). Use the `variant` prop on `CodeIcon`, which sets `data-variant` for CSS styling.

```tsx
// Using CodeIcon convenience props
<CodeIcon fileName="main.ts" size={18} strokeWidth={1.5} variant="outline" />

// Or pass your own class/style
<CodeIcon fileName="app.jsx" className="text-sky-500" style={{ opacity: 0.9 }} />
```

Provider-level defaults (applied only when a consumer does not provide explicit props):

```tsx
<IconProvider
  size={20}
  color="currentColor"
  defaultStrokeWidth={1.5}
  defaultVariant="outline"
>
  <CodeIcon fileName="index.ts" />
  <CodeIcon fileName="app.jsx" strokeWidth={2} /> {/* keeps 2, provider not applied */}
</IconProvider>
```

### Variant control via data-attribute

If `data-variant` is provided (either by `CodeIcon` via its `variant` prop or directly on the element), base icons will not override `fill` or `stroke`, allowing consumer CSS to fully control styles:

```tsx
<CodeIcon fileName="logo.svg" variant="filled" />
```

Style with CSS:

```css
svg[data-variant="filled"] path { fill: currentColor; stroke: none; }
svg[data-variant="outline"] path { fill: none; stroke: currentColor; }
```

If no variant is provided, both `fill` and `stroke` default to the effective token-derived color unless explicitly set via props or style.

## Dynamic import

Use the dynamic loader to code-split icon components and reduce initial bundle size. The loader attempts a direct dynamic import for generated icons and falls back to a small map for common keys. If the icon cannot be loaded dynamically, it returns null so you can fall back to the static registry.

```tsx
import * as React from 'react';
import { loadIcon, CodeIcon } from 'code-lang-icons';

export function LazyIcon({ keyOrExt }: { keyOrExt: string }) {
  const [Comp, setComp] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    let alive = true;
    loadIcon(keyOrExt).then((C) => {
      if (alive) setComp(() => C);
    });
    return () => {
      alive = false;
    };
  }, [keyOrExt]);

  if (Comp) {
    return <Comp size={18} data-variant="outline" />;
  }

  // Fallback to static resolver
  return <CodeIcon extension={keyOrExt} size={18} />;
}
```

Notes:
- `loadIcon(key)` tries: `../icons/generated/${PascalCase(key)}Icon.js` at runtime in the built output, then a small loader map (`js`, `ts`, `react`, `node`, `docker`) for typical code-splitting. Otherwise it returns `null`.
- If `loadIcon` returns `null`, fall back to the registry-backed `<CodeIcon>` as shown.

## Mapping updates via CLI

You can extend the internal mappings from JSON using a simple CLI.

```sh
# From a file
pnpm mappings:update path/to/partial.json

# From stdin
echo '{ "extensions": { "zig": "zig" } }' | pnpm mappings:update:stdin
```

The JSON shape is a Partial of the registry mapping:
```json
{
  "extensions": { "zig": "zig" },
  "filenames": { "Dockerfile": "docker" },
  "identifiers": { "bun": "node" },
  "aliases": { "tsconfig": "tsconfig" }
}
```

A summary of merged keys is printed and the process exits with code 0 on success (1 on parse/validation errors).

## CI

GitHub Actions runs on push/pull_request to the main branch across Node 18.x and 20.x. Steps include install, build, typecheck, lint, and an icon generation smoke test.

See `.github/workflows/ci.yml`.

## Scripts and bundling

- Ensure builds are clean and validated:

```sh
pnpm run build:check
```

This runs clean, build, typecheck, and lint sequentially. The package is configured as side-effect free. The `exports` field includes a subpath for dynamic utilities: `code-lang-icons/dynamic/*` mapped to `dist/dynamic/*` for ESM/CJS/types.

## Release

This repo uses Changesets. Typical flow:

```sh
pnpm changeset        # add a changeset
pnpm changeset version
pnpm install
pnpm build
pnpm changeset publish
```

## Build

```sh
pnpm build
```

Outputs ESM and CJS to `dist/` with `.d.ts` types generated.

## License

MIT © Anurag