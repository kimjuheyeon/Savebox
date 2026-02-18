import { cn } from '@/lib/utils';

export function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        'bg-[#2a3347]',
        className,
      )}
      {...props}
    />
  );
}
