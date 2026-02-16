'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Folder, House, LayoutList, UserRound } from 'lucide-react';
import ShareExtension from '@/components/ShareExtension';

const NAVS = [
  { href: '/', label: 'Home', icon: House },
  { href: '/collections', label: 'Collections', icon: Folder },
  { href: '/content', label: 'Contents', icon: LayoutList },
  { href: '/settings', label: 'Profile', icon: UserRound },
];

export default function MainAppLayout({ children }) {
  const pathname = usePathname();
  const [context, setContext] = useState(1);

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 맥락 토글 버튼 — 윈도우 우측 상단 고정 */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center rounded-[8px] border border-slate-200 bg-white p-1 shadow-md">
          <button
            onClick={() => setContext(1)}
            className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition-all ${
              context === 1
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            맥락 1
          </button>
          <button
            onClick={() => setContext(2)}
            className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition-all ${
              context === 2
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            맥락 2
          </button>
        </div>
      </div>

      {/* 맥락 1: SNS 빠른 저장 (Share Extension) */}
      {context === 1 && <ShareExtension />}

      {/* 맥락 2: 앱 직접 열기 (Save App) */}
      {context === 2 && (
        <div className="mx-auto w-full max-w-[440px] min-h-screen bg-[#F8FAFF]">
          <div className="pb-16">{children}</div>

          <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[440px] -translate-x-1/2 border-t border-slate-200 bg-white px-2 py-2">
            <div className="grid grid-cols-4 gap-1">
              {NAVS.map((nav) => {
                const ActiveIcon = nav.icon;
                const active = isActive(nav.href);
                return (
                  <Link
                    key={nav.href}
                    href={nav.href}
                    className={`flex flex-col items-center gap-1 rounded-[8px] px-2 py-2 transition ${
                      active ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <ActiveIcon size={20} strokeWidth={active ? 2.2 : 1.8} />
                    <span className={`text-[11px] font-semibold ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {nav.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
