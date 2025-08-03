import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('EslintIcon');

export const EslintIcon = forwardRef<SVGSVGElement, IconProps>(function EslintIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <polygon points="12,2 19,6.5 19,17.5 12,22 5,17.5 5,6.5" fill="#4B32C3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="#fff" />
    </BaseIcon>
  );
});
EslintIcon.displayName = 'EslintIcon';
export default EslintIcon;
