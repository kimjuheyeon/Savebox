import Link from 'next/link';

export default function ListItem({ href, leading = null, title, subtitle = null, trailing = null, onClick, className = '' }) {
  const baseClass = `flex items-center gap-3 rounded-[8px] bg-[#1E1E1E] px-3 py-3 transition hover:bg-[#212b42] active:bg-[#283350] ${className}`;

  if (!title) {
    return null;
  }

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClass}>
        {leading}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
          {subtitle && <p className="truncate text-xs text-[#777777]">{subtitle}</p>}
        </div>
        {trailing}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${baseClass} ${onClick ? 'cursor-pointer' : 'cursor-default'} text-left`}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
        {subtitle && <p className="truncate text-xs text-[#777777]">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}
