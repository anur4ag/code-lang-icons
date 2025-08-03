import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('JsonIcon');

export const JsonIcon = forwardRef<SVGSVGElement, IconProps>(function JsonIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <path d="M8 5c-2 0-3 2-3 4s1 4 3 4-3 2-3 4 1 4 3 4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 5c2 0 3 2 3 4s-1 4-3 4 3 2 3 4-1 4-3 4" fill="none" stroke="currentColor" strokeWidth="2" />
    </BaseIcon>
  );
});
JsonIcon.displayName = 'JsonIcon';
export default JsonIcon;
