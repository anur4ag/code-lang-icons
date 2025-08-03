import React, { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { Theme, IconRegistry } from '../types';
import type { IconProps } from '../icons/_base';
import { useIconConfig, getIconOverride, useIconTokens } from './IconProvider';
import { resolveIconKey } from '../utils/resolve';
import placeholderRegistry, { getPlaceholderIcon } from '../icons/placeholder-icons';

export interface CodeIconProps {
  fileName?: string;
  extension?: string;
  identifier?: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  ariaLabel?: string;
  theme?: Theme;
  strokeWidth?: number | string;
  variant?: 'filled' | 'outline';
}

export const CodeIcon = forwardRef<SVGSVGElement, CodeIconProps>(function CodeIcon(
  {
    fileName,
    extension,
    identifier,
    size,
    color,
    className,
    style,
    title,
    ariaLabel,
    theme,
    strokeWidth,
    variant,
    ...rest
  }: CodeIconProps & Omit<IconProps, never>,
  ref
) {
  const cfg = useIconConfig();
  useIconTokens(); // ensure provider tokens are initialized even if not directly used here
  const key = resolveIconKey({ fileName, extension, identifier }) || 'default';

  // Provider defaults merge (only apply when consumer has not provided explicit props)
  const finalSize = size ?? cfg.size ?? 20;
  const finalColor = color ?? (cfg as any).color ?? undefined;
  const finalTheme = theme ?? cfg.theme ?? 'auto';
  const finalStrokeWidth = strokeWidth ?? (cfg as any).defaultStrokeWidth;
  const finalVariant = variant ?? (cfg as any).defaultVariant;

  // Overrides from provider
  const OverrideIcon = getIconOverride(key);

  // Resolve registry component
  const RegistryIcon =
    (OverrideIcon as React.ComponentType<IconProps>) ||
    (placeholderRegistry as IconRegistry)[key] ||
    getPlaceholderIcon(key) ||
    (placeholderRegistry as IconRegistry)['default'];

  const IconComponent = RegistryIcon as React.ComponentType<IconProps>;

  return (
    <IconComponent
      key={key}
      ref={ref as any}
      size={finalSize}
      {...(finalColor !== undefined ? { color: finalColor } : {})}
      className={className}
      style={style}
      title={title}
      ariaLabel={ariaLabel}
      theme={finalTheme}
      strokeWidth={finalStrokeWidth}
      {...(finalVariant ? ({ 'data-variant': finalVariant } as any) : {})}
      {...(rest as any)}
    />
  );
});