import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', ...props }) {
  const variantClass =
    variant === 'destructive'
      ? 'border-rose-500/40 text-rose-700 bg-rose-50'
      : 'border-sky-500/30 text-sky-700 bg-sky-50';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[8px] border px-2.5 py-0.5 text-[11px] font-medium',
        variantClass,
        className,
      )}
      {...props}
    />
  );
}
