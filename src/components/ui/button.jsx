import * as React from 'react';

import { cn } from '@/lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none';

const variantMap = {
  default: 'bg-[#3385FF] text-white hover:bg-[#2f78f0] active:bg-[#2669d9]',
  outline: 'border border-[#323232] text-[#ffffff] bg-[#1E1E1E] hover:bg-[#212b42] active:bg-[#283350]',
  ghost: 'bg-transparent text-[#777777] hover:bg-[#1f2a42] active:bg-[#2a3652]',
  destructive: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-400',
};

const sizeMap = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-[8px] px-3 text-xs',
  lg: 'h-11 rounded-[8px] px-6',
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}) {
  if (asChild) {
    return React.cloneElement(
      props.children,
      {
        ...props,
        className: cn(base, variantMap[variant], sizeMap[size], className),
      },
      props.children.props.children,
    );
  }

  return (
    <button
      className={cn(base, variantMap[variant], sizeMap[size], className)}
      {...props}
    />
  );
}
