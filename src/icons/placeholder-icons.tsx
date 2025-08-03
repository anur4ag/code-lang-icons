import { createBaseIcon } from './_base';
import type { IconProps } from './_base';
import type { IconRegistry } from '../types';

// A minimal factory that returns a component rendering BaseIcon with an additional glyph path.
// We avoid JSX to not depend on react/jsx-runtime in this file.
function withGlyph(name: string, glyphPath: string) {
  const Base = createBaseIcon(name);
  const Comp = Object.assign(
    (props: IconProps) =>
      Base({
        ...props,
        // children are not used by BaseIcon; glyph is illustrative in placeholders only.
      } as any),
    { displayName: name }
  );
  // For placeholders, we keep simple distinctive displayName only.
  return Comp as any;
}

// Core tech/file icons
export const JsIcon = createBaseIcon('JsIcon');
export const TsIcon = createBaseIcon('TsIcon');
export const PyIcon = createBaseIcon('PyIcon');
export const GoIcon = createBaseIcon('GoIcon');
export const RsIcon = createBaseIcon('RsIcon');
export const VueIcon = createBaseIcon('VueIcon');
export const SvelteIcon = createBaseIcon('SvelteIcon');
export const AstroIcon = createBaseIcon('AstroIcon');
export const ReactIcon = createBaseIcon('ReactIcon');
export const NodeIcon = createBaseIcon('NodeIcon');

// File and tool icons
export const DefaultFileIcon = createBaseIcon('DefaultFileIcon');
export const JsonIcon = createBaseIcon('JsonIcon');
export const YamlIcon = createBaseIcon('YamlIcon');
export const MdIcon = createBaseIcon('MdIcon');
export const HtmlIcon = createBaseIcon('HtmlIcon');
export const CssIcon = createBaseIcon('CssIcon');
export const DockerIcon = createBaseIcon('DockerIcon');
export const GitIcon = createBaseIcon('GitIcon');
export const EslintIcon = createBaseIcon('EslintIcon');
export const PrettierIcon = createBaseIcon('PrettierIcon');
export const JestIcon = createBaseIcon('JestIcon');
export const ViteIcon = createBaseIcon('ViteIcon');
export const WebpackIcon = createBaseIcon('WebpackIcon');
export const RollupIcon = createBaseIcon('RollupIcon');
export const BabelIcon = createBaseIcon('BabelIcon');
export const TypescriptConfigIcon = createBaseIcon('TypescriptConfigIcon');
export const NpmIcon = createBaseIcon('NpmIcon');
export const YarnIcon = createBaseIcon('YarnIcon');
export const PnpmIcon = createBaseIcon('PnpmIcon');
export const TerraformIcon = createBaseIcon('TerraformIcon');
export const AwsIcon = createBaseIcon('AwsIcon');
export const GcpIcon = createBaseIcon('GcpIcon');
export const AzureIcon = createBaseIcon('AzureIcon');

// Registry with stable keys
const placeholderRegistry: IconRegistry = {
  default: DefaultFileIcon,
  js: JsIcon,
  ts: TsIcon,
  py: PyIcon,
  go: GoIcon,
  rs: RsIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  astro: AstroIcon,
  react: ReactIcon,
  node: NodeIcon,
  json: JsonIcon,
  yaml: YamlIcon,
  md: MdIcon,
  html: HtmlIcon,
  css: CssIcon,
  docker: DockerIcon,
  git: GitIcon,
  eslint: EslintIcon,
  prettier: PrettierIcon,
  jest: JestIcon,
  vite: ViteIcon,
  webpack: WebpackIcon,
  rollup: RollupIcon,
  babel: BabelIcon,
  'ts-config': TypescriptConfigIcon,
  npm: NpmIcon,
  yarn: YarnIcon,
  pnpm: PnpmIcon,
  terraform: TerraformIcon,
  aws: AwsIcon,
  gcp: GcpIcon,
  azure: AzureIcon,
};

export default placeholderRegistry;

export function getPlaceholderIcon(key: string) {
  return (placeholderRegistry as any)[key] as any;
}