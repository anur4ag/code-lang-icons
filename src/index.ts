export * from './components/CodeIcon';
export * from './components/IconProvider';
export * from './icons';
export * from './mapping';
export * from './utils/resolve';
export * from './utils/autoDetect';

// Avoid wildcard re-export conflict for IconProps by explicitly re-exporting names
export type {
  Theme,
  IconKey,
  IconConfig,
  IconRegistry,
  ResolveInput,
  IconComponent,
  IconProps
} from './types';

// Mapping authoring APIs
export { registerIcon, extendMappings, getMappings } from './mapping';

// Provider hooks
export { useIconConfig, useIconTokens, useSetIconOverrides } from './components/IconProvider';

// Dynamic utilities
export * from './dynamic/loadIcon';