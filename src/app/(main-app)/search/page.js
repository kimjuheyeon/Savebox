'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X, Flame, Clock3 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ListItem from '@/components/ListItem';
import { MOCK_CONTENTS, formatKoreanDate } from '@/lib/prototypeData';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';

const POPULAR_SEARCHES = ['디자인 시스템', '파스타 레시피', '리액트 성능', '컬러 팔레트'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(['디자인 시스템', '파스타 레시피']);

  const cleaned = query.trim();
  const results = useMemo(() => {
    if (!cleaned) return [];
    const lower = cleaned.toLowerCase();
    return MOCK_CONTENTS.filter((item) => {
      return (
        item.title.toLowerCase().includes(lower) ||
        (item.memo || '').toLowerCase().includes(lower) ||
        item.source.toLowerCase().includes(lower)
      );
    });
  }, [cleaned]);

  const highlight = (text, term) => {
    if (!term) return text;
    const lower = term.toLowerCase();
    const idx = text.toLowerCase().indexOf(lower);
    if (idx === -1) return text;
    const end = idx + term.length;

    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded-[4px] px-0.5 bg-indigo-100 text-indigo-700">{text.slice(idx, end)}</mark>
        {text.slice(end)}
      </>
    );
  };

  const applySearch = (term) => {
    const next = term.trim();
    if (!next) return;
    setRecentSearches((prev) => {
      const dedup = prev.filter((item) => item.toLowerCase() !== next.toLowerCase());
      return [next, ...dedup].slice(0, 10);
    });
    setQuery(next);
  };

  const removeRecent = (target) => {
    setRecentSearches((prev) => prev.filter((item) => item !== target));
  };

  return (
    <main className="mx-auto w-full max-w-[440px]">
      <PageHeader title="검색">
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="검색어 입력 (제목/메모/출처)"
              className="w-full rounded-[8px] border border-slate-200 py-2 pl-9 pr-9 text-sm focus:border-indigo-400 focus:outline-none"
            />
            {!!query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className={`absolute right-2 top-1/2 ${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} -translate-y-1/2 rounded-[8px] text-slate-400`}
                aria-label="입력값 지우기"
              >
                <X size={ICON_BUTTON_ICON_SIZE} />
              </button>
            )}
          </div>
          <button
            onClick={() => applySearch(query)}
            className="rounded-[8px] bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
          >
            검색
          </button>
        </div>
      </PageHeader>

      <div className="px-4 pt-4">
        {cleaned.length === 0 && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock3 size={16} />
                최근 검색어
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => applySearch(item)}
                    className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-1.5 text-xs"
                  >
                    <span>{item}</span>
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        removeRecent(item);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Flame size={16} />
                인기 검색어
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    onClick={() => applySearch(item)}
                    className="rounded-[8px] bg-slate-900 px-3 py-1.5 text-xs text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {cleaned.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">"{cleaned}" 검색 결과 {results.length}개</h2>
            {results.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
                검색 결과가 없어요. 검색어를 바꿔서 다시 시도하세요.
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((item) => (
                  <ListItem
                    key={item.id}
                    href={`/content/${item.id}`}
                    leading={
                      <div className="h-12 w-12 overflow-hidden rounded-[8px] bg-slate-100">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-lg font-bold text-slate-500">
                            {item.title.charAt(0)}
                          </div>
                        )}
                      </div>
                    }
                    title={highlight(item.title, cleaned)}
                    subtitle={
                      <>
                        {item.source} · {formatKoreanDate(item.createdAt)}
                        {item.memo && (
                          <span className="mt-1 block text-xs text-slate-400">
                            {highlight(item.memo, cleaned)}
                          </span>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
