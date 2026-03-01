'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function DevContextToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const isContext1 = pathname?.startsWith('/share');
  const label = isContext1 ? '맥락1' : '맥락2';
  const targetLabel = isContext1 ? '맥락2' : '맥락1';

  const handleToggle = () => {
    if (isContext1) {
      router.push('/');
    } else {
      router.push('/share?url=https://www.instagram.com/p/example123&title=디자인%20영감%20모음');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur transition active:scale-95"
      style={{
        background: isContext1 ? 'rgba(99,102,241,0.9)' : 'rgba(51,133,255,0.9)',
        color: '#fff',
      }}
    >
      <span className="opacity-70">{label}</span>
      <span className="text-[10px] opacity-50">→</span>
      <span>{targetLabel}</span>
    </button>
  );
}
