import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-emerald-950/50 border-emerald-800',
  destructive: 'bg-rose-950/50 border-rose-800',
  warning: 'bg-amber-950/50 border-amber-800',
};

export function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'rounded-[8px] border px-4 py-3 text-sm',
        variantStyles[variant] || variantStyles.default,
        className,
      )}
      role="status"
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 font-medium text-slate-100', className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn('text-[#777777] text-sm', className)} {...props} />;
}
