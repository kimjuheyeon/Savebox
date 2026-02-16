import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, backHref, rightContent, children }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="flex items-center justify-between gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-[8px] px-1 py-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            <span className="text-lg font-bold text-slate-900">{title}</span>
          </Link>
        ) : (
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
        )}
        {rightContent && <div className="flex shrink-0 items-center gap-2">{rightContent}</div>}
      </div>
      {children}
    </header>
  );
}
