import React, { forwardRef } from 'react';
import type { CSSProperties, SVGProps } from 'react';
import type { Theme } from '../types';
import { getTokens } from '../theming/tokens';

export type IconSize = number | string;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color' | 'role'> {
  size?: IconSize;
  color?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  ariaLabel?: string;
  role?: 'img' | 'presentation';
  strokeWidth?: number | string;
  theme?: Theme;
  // consumer may pass through a data-variant; we don't declare it explicitly, but we'll read from rest
}

/**
 * Normalize size to a CSS length string.
 * - number => px
 * - string => returned as-is
 */
export function normalizeSize(size?: IconSize): string | undefined {
  if (size === undefined || size === null) return undefined;
  if (typeof size === 'number' && Number.isFinite(size)) return `${size}px`;
  return String(size);
}

export function createBaseIcon(displayName: string) {
  const BaseIcon = forwardRef<SVGSVGElement, IconProps>(function BaseIcon(
    {
      size = 20,
      color,
      className,
      style,
      title,
      ariaLabel,
      role,
      strokeWidth,
      theme,
      ...rest
    }: IconProps,
    ref
  ) {
    const labelled = Boolean(title || ariaLabel);
    const svgRole: 'img' | 'presentation' | undefined = labelled ? (role ?? 'img') : undefined;
    const ariaHidden = labelled ? undefined : true;
    const finalSize = normalizeSize(size);

    // Compute color from theme tokens when not explicitly provided
    const tokens = getTokens(theme);
    const effectiveColor = color ?? tokens.foreground;

    // When aria-hidden, remove from tab order.
    const tabIndex = ariaHidden ? -1 : (rest as any).tabIndex;

    // variant passthrough via data-attribute
    const variant = (rest as any)['data-variant'] as 'filled' | 'outline' | undefined;

    // Merge style without overwriting provided color
    const svgStyle = {
      ...style,
    } as CSSProperties;

    // Default paint props when variant not explicitly controlled by consumer:
    // - If consumer provided data-variant, do not override fill/stroke (so CSS can style)
    // - Otherwise set both fill and stroke to effectiveColor unless explicitly set.
    const svgProps: Partial<SVGProps<SVGSVGElement>> = {};
    const hasFillAttr = rest.fill !== undefined || (style && (style as any).fill !== undefined);
    const hasStrokeAttr = rest.stroke !== undefined || (style && (style as any).stroke !== undefined);

    if (!variant) {
      if (!hasFillAttr) {
        (svgProps as any).fill = effectiveColor;
      }
      if (!hasStrokeAttr) {
        (svgProps as any).stroke = effectiveColor;
      }
    }

    // Ensure non-scaling stroke behavior for crisp lines when strokeWidth is applied.
    const vectorEffectProps = { vectorEffect: 'non-scaling-stroke' as any };

    return React.createElement(
      'svg',
      {
        ref,
        width: finalSize,
        height: finalSize,
        viewBox: '0 0 24 24',
        role: svgRole,
        'aria-hidden': ariaHidden as any,
        'aria-label': ariaLabel as any,
        'data-theme': theme as any,
        ...(variant ? { 'data-variant': variant } : {}),
        focusable: 'false',
        tabIndex: tabIndex as any,
        xmlns: 'http://www.w3.org/2000/svg',
        className,
        style: svgStyle,
        ...svgProps,
        ...rest,
      } as any,
      title ? React.createElement('title', null, title) : null,
      React.createElement('rect', {
        x: 3,
        y: 3,
        width: 18,
        height: 18,
        rx: 2,
        stroke: hasStrokeAttr || variant ? (rest as any).stroke : effectiveColor,
        strokeWidth: strokeWidth ?? 2,
        fill: hasFillAttr || variant ? (rest as any).fill : 'none',
        vectorEffect: 'non-scaling-stroke',
      })
    );
  });
  BaseIcon.displayName = displayName;
  return BaseIcon;
}