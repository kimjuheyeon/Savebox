import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, backHref, rightContent, children }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#323232] bg-[#1E1E1E]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#1E1E1E]/90">
      <div className="flex items-center justify-between gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-9 min-h-[36px] items-center gap-2 rounded-[8px] px-2 text-sm font-semibold text-[#777777] transition hover:text-white active:bg-[#1e2a3f]"
          >
            <ArrowLeft size={18} />
            <span className="text-lg font-bold text-slate-100">{title}</span>
          </Link>
        ) : (
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
        )}
        {rightContent && (
          <div className="flex shrink-0 items-center gap-2 [&>*]:inline-flex [&>*]:items-center [&>*]:justify-center [&>*]:min-h-[36px]">
            {rightContent}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}
