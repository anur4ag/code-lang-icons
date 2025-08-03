import React, { forwardRef } from 'react';
import { createBaseIcon, type IconProps } from '../_base';

const BaseIcon = createBaseIcon('JsIcon');

export const JsIcon = forwardRef<SVGSVGElement, IconProps>(function JsIcon(props, ref) {
  return (
    <BaseIcon ref={ref} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#F7DF1E" stroke="none" />
      <path d="M10 7v10M14 7h3a3 3 0 1 1 0 6h-3v4" fill="none" stroke="currentColor" strokeWidth="2" />
    </BaseIcon>
  );
});
JsIcon.displayName = 'JsIcon';
export default JsIcon;
