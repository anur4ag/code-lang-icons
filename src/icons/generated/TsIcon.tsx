import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('TsIcon');

export const TsIcon = forwardRef<SVGSVGElement, IconProps>(function TsIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#3178C6" stroke="none" />
      <path d="M6 9h8M10 9v8M14 13h4a2 2 0 1 1 0 4h-3M18 13v-1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
});
TsIcon.displayName = 'TsIcon';
export default TsIcon;
