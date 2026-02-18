import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2 text-sm text-slate-100 placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
        className,
      )}
      {...props}
    />
  );
}
