export * from "./placeholder-icons";
export type { IconProps } from "./_base";

// Registries
import placeholderRegistryDefault from "./placeholder-icons";
// Re-export placeholder registry as default
export { default as placeholderRegistry } from "./placeholder-icons";

/**
 * Avoid top-level await to support ES2020 target in bundlers.
 * We try a synchronous require for CJS or dynamic import wrapped in a function
 * that consumers can opt-in to if they want generated icons.
 */
let __generated: Record<string, unknown> = {};
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const require: any | undefined;

function tryLoadGeneratedSync(): Record<string, unknown> {
  try {
    // In CJS bundles, tsup/esbuild can convert this to require; in ESM it will be treeshaken if not supported.
    if (typeof require === "function") {
      const mod = require("./generated/registry");
      return (mod as any)?.generatedRegistry ?? {};
    }
  } catch {
    // ignore
  }
  return {};
}

__generated = tryLoadGeneratedSync();

// Mutable registry object to avoid reassigning a const symbol during async load.
export const registry: Record<string, unknown> = {
  ...(placeholderRegistryDefault as Record<string, unknown>),
  ...__generated,
};

// Optional async loader for environments that want to lazy-load generated exports.
export async function ensureGeneratedLoaded(): Promise<void> {
  if (Object.keys(__generated).length) return;
  try {
    const mod = await import("./generated/registry");
    __generated = (mod as any)?.generatedRegistry ?? {};
    // Merge into existing object to keep the same reference
    Object.assign(registry, __generated);
  } catch {
    // ignore if not present
  }
}

// Re-export generated types/exports guarded via type-only import to avoid TLA.
export type {} from "./generated";