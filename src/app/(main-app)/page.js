'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ListItem from '@/components/ListItem';
import { getInitial, getSourceMeta } from '@/lib/prototypeData';
import { fetchContents, fetchCollections } from '@/lib/api';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';

export default function MainDashboardPage() {
  const [recentItems, setRecentItems] = useState([]);
  const [topCollections, setTopCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [contentsResult, collections] = await Promise.all([
          fetchContents({ limit: 8 }),
          fetchCollections(),
        ]);
        setRecentItems(contentsResult.contents);
        setTopCollections(
          collections
            .filter((col) => !col.is_system)
            .slice(0, 4),
        );
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[440px] min-h-screen px-4 py-10">
        <div className="animate-pulse rounded-2xl bg-[#1E1E1E] p-8 text-center text-sm text-[#616161]">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
      <main className="mx-auto w-full max-w-[440px] min-h-screen">
      <PageHeader
        title="SaveBox"
        rightContent={
          <Link
            href="/search"
            className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] bg-[#3385FF] text-white transition hover:bg-[#2f78f0] active:bg-[#2669d9]`}
            aria-label="검색"
          >
            <Search size={ICON_BUTTON_ICON_SIZE} />
          </Link>
        }
      />

      <section className="mb-6 px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">최근 저장 항목</h2>
          <Link href="/content" className="text-sm font-medium text-indigo-400">
            전체보기
          </Link>
        </div>

        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto pb-1">
          {recentItems.length === 0 && (
            <div className="w-full rounded-[8px] border border-dashed border-[#323232] bg-[#1E1E1E] p-8 text-center text-sm text-[#777777]">
              아직 저장된 콘텐츠가 없어요
            </div>
          )}
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href={`/content/${item.id}`}
              className="w-36 shrink-0 rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-2.5 shadow-sm transition hover:bg-[#212b42] hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden rounded-[8px] bg-[#1E1E1E]">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2">
                    {(() => { const s = getSourceMeta(item.source || 'Other'); return s.iconSrc ? (
                      <img src={s.iconSrc} alt={item.source} className="h-8 w-8 object-contain opacity-60" />
                    ) : (
                      <span className="text-2xl font-black text-[#616161]">{(item.source || 'S').charAt(0)}</span>
                    ); })()}
                    <p className="line-clamp-2 text-center text-[10px] font-medium text-[#777777]">{item.title}</p>
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-100">{item.title}</p>
              <p className="mt-1 text-[11px] text-[#777777]">{item.source}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">컬렉션</h2>
          <Link href="/collections" className="text-sm font-semibold text-indigo-400">
            더보기
          </Link>
        </div>

        <div className="space-y-2">
          {topCollections.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-[#323232] bg-[#1E1E1E] p-8 text-center text-sm text-[#777777]">
              아직 컬렉션이 없어요
            </div>
          )}
          {topCollections.map((collection) => (
            <ListItem
              key={collection.id}
              href={`/content?collection=${collection.id}`}
              leading={
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1E1E1E] text-lg">
                  📁
                </div>
              }
              title={collection.name}
              subtitle={collection.description}
              trailing={
                <p className="text-sm font-semibold text-[#777777]">{collection.item_count || 0}개</p>
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
