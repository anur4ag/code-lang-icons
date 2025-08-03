import type { IconComponent, IconKey, RegistryMapping } from '../types';

// Strongly-typed registries (module-local mutable state)
const extensions: Record<string, IconKey> = {
  js: 'js',
  mjs: 'node',
  cjs: 'node',
  ts: 'ts',
  tsx: 'react',
  jsx: 'react',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'md',
  mdx: 'mdx',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  svg: 'svg',
  py: 'py',
  rb: 'rb',
  go: 'go',
  rs: 'rs',
  java: 'java',
  kt: 'kt',
  swift: 'swift',
  php: 'php',
  cs: 'cs',
  cpp: 'cpp',
  c: 'c',
  sh: 'sh',
  env: 'env',
  lock: 'lock',
  dockerfile: 'docker',
  makefile: 'make',
};

const filenames: Record<string, IconKey> = {
  '.env': 'env',
  '.gitignore': 'git',
  '.gitattributes': 'git',
  '.editorconfig': 'settings',
  '.eslintrc': 'eslint',
  '.eslintrc.js': 'eslint',
  '.prettierrc': 'prettier',
  '.prettierrc.js': 'prettier',
  'package.json': 'npm',
  'tsconfig.json': 'tsconfig',
  'yarn.lock': 'yarn',
  'pnpm-lock.yaml': 'pnpm',
  'package-lock.json': 'npm',
  dockerfile: 'docker',
  makefile: 'make',
  '.npmrc': 'npm',
  '.nvmrc': 'node',
  '.babelrc': 'babel',
  'jest.config.js': 'jest',
  'vite.config.ts': 'vite',
  'rollup.config.js': 'rollup',
  'webpack.config.js': 'webpack',
};

const identifiers: Record<string, IconKey> = {
  react: 'react',
  next: 'next',
  vue: 'vue',
  svelte: 'svelte',
  angular: 'angular',
  astro: 'astro',
  tailwind: 'tailwind',
  bootstrap: 'bootstrap',
  jest: 'jest',
  vitest: 'vitest',
  webpack: 'webpack',
  vite: 'vite',
  rollup: 'rollup',
  eslint: 'eslint',
  prettier: 'prettier',
  babel: 'babel',
  tsconfig: 'tsconfig',
  npm: 'npm',
  yarn: 'yarn',
  pnpm: 'pnpm',
  docker: 'docker',
  kubernetes: 'kubernetes',
  terraform: 'terraform',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  node: 'node',
  typescript: 'ts',
  javascript: 'js',
  json: 'json',
  git: 'git',
};

const aliases: Record<string, IconKey> = {
  jsx: 'react',
  tsx: 'react',
  mjs: 'node',
  cjs: 'node',
  nodejs: 'node',
  yml: 'yaml',
  mdx: 'mdx',
  dockerfile: 'docker',
  makefile: 'make',
  package: 'npm',
  tsconfig: 'tsconfig',
  config: 'settings',
};

// Authoring API
export function registerIcon(key: IconKey, component: IconComponent, target?: 'identifier' | 'extension' | 'filename'): void {
  // Registration of the component is expected to happen in icon registries; here we attach mapping entries only.
  const k = String(key);
  if (target === 'identifier') {
    identifiers[k] = key;
  } else if (target === 'filename') {
    filenames[k] = key;
  } else if (target === 'extension') {
    extensions[k.replace(/^\./, '')] = key;
  } else {
    // default: identifier registry to keep flexible
    identifiers[k] = key;
  }
}

export function extendMappings(partial: Partial<RegistryMapping>): void {
  if (partial.extensions) Object.assign(extensions, partial.extensions);
  if (partial.filenames) Object.assign(filenames, partial.filenames);
  if (partial.identifiers) Object.assign(identifiers, partial.identifiers);
  if (partial.aliases) Object.assign(aliases, partial.aliases);
}

export function getMappings(): RegistryMapping {
  return {
    extensions: { ...extensions },
    filenames: { ...filenames },
    identifiers: { ...identifiers },
    aliases: { ...aliases },
  };
}

// Default combined mapping export (snapshot, non-live to preserve sideEffects:false)
const mapping: RegistryMapping = getMappings();
export default mapping;