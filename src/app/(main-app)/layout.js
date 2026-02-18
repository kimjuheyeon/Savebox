'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Folder, House, LayoutList, UserRound } from 'lucide-react';

const NAVS = [
  { href: '/', label: 'Home', icon: House },
  { href: '/collections', label: 'Collections', icon: Folder },
  { href: '/content', label: 'Contents', icon: LayoutList },
  { href: '/settings', label: 'Profile', icon: UserRound },
];

export default function MainAppLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) =>
    pathname === null
      ? false
      : href === '/'
        ? pathname === '/'
        : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto w-full max-w-[440px] min-h-screen bg-[#101010]">
        <div style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>

        <nav
          className="fixed bottom-0 left-1/2 z-20 w-full max-w-[440px] -translate-x-1/2 border-t border-[#323232] bg-[#101010] px-2 pt-2 backdrop-blur supports-[backdrop-filter]:bg-[#101010]"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="grid grid-cols-4 gap-1">
            {NAVS.map((nav) => {
              const ActiveIcon = nav.icon;
              const active = isActive(nav.href);
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-[8px] px-2 py-2 min-h-[44px] transition ${
                    active ? 'text-[#3385FF]' : 'text-[#616161] hover:bg-[#1f2a42] active:bg-[#2a3652]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <ActiveIcon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  <span className={`text-[11px] font-semibold ${active ? 'text-[#3385FF]' : 'text-[#616161]'}`}>
                    {nav.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
