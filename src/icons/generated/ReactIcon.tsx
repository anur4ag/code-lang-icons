import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('ReactIcon');

export const ReactIcon = forwardRef<SVGSVGElement, IconProps>(function ReactIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(0 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(120 12 12)"/>
      </g>
    </BaseIcon>
  );
});
ReactIcon.displayName = 'ReactIcon';
export default ReactIcon;
