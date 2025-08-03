import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('NodeIcon');

export const NodeIcon = forwardRef<SVGSVGElement, IconProps>(function NodeIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#83CD29" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9v6l3 2 3-2V9" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </BaseIcon>
  );
});
NodeIcon.displayName = 'NodeIcon';
export default NodeIcon;
