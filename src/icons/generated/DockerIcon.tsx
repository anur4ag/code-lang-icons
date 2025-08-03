import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('DockerIcon');

export const DockerIcon = forwardRef<SVGSVGElement, IconProps>(function DockerIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#1D63ED" stroke="none" />
      <rect x="5" y="10" width="3" height="3" fill="currentColor" />
      <rect x="9" y="10" width="3" height="3" fill="currentColor" />
      <rect x="13" y="10" width="3" height="3" fill="currentColor" />
      <rect x="9" y="6" width="3" height="3" fill="currentColor" />
      <path d="M3 16c1.5 2.5 4 4 9 4s7.5-1.5 9-4h-3c-1 0-2-.5-2-1.5S14.5 13 13 13H8c-1.5 0-3 .5-3 1.5S4 16 3 16z" fill="currentColor" />
    </BaseIcon>
  );
});
DockerIcon.displayName = 'DockerIcon';
export default DockerIcon;
