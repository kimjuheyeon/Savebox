import * as React from 'react';

import { cn } from '@/lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none';

const variantMap = {
  default: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700',
  outline: 'border border-slate-300 text-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200',
  destructive: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700',
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
