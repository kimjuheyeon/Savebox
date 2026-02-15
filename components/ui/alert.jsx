import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'bg-emerald-50 border-emerald-200',
  destructive: 'bg-rose-50 border-rose-200',
  warning: 'bg-amber-50 border-amber-200',
};

export function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        variantStyles[variant] || variantStyles.default,
        className,
      )}
      role="status"
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 font-medium', className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn('text-slate-700 text-sm', className)} {...props} />;
}
