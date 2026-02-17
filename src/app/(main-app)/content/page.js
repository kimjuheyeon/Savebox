'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, MoreHorizontal, PencilLine, Search, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { COLOR_TAGS, getSourceMeta, shortDate } from '@/lib/prototypeData';
import { fetchContents, fetchCollections, deleteContent } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'name', label: '이름순' },
];

export default function ContentPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[440px] px-4 py-6">
          <div className="animate-pulse rounded-2xl bg-white p-8 text-center text-sm text-slate-400">
            불러오는 중...
          </div>
        </main>
      }
    >
      <ContentPageInner />
    </Suspense>
  );
}

function ContentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionParam = searchParams?.get?.('collection') || null;

  const [viewMode, setViewMode] = useState('list');
  const [sort, setSort] = useState('latest');
  const [sourceFilter, setSourceFilter] = useState('전체');
  const [gridMenuId, setGridMenuId] = useState(null);
  const [allContents, setAllContents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [contentsResult, cols] = await Promise.all([
          fetchContents({ collectionId: collectionParam || undefined }),
          fetchCollections(),
        ]);
        setAllContents(contentsResult.contents);
        setCollections(cols);
      } catch (err) {
        console.error('Content page load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [collectionParam]);

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === collectionParam),
    [collections, collectionParam],
  );

  const sourceFilters = useMemo(
    () => ['전체', ...new Set(allContents.map((item) => item.source).filter(Boolean))],
    [allContents],
  );

  const items = useMemo(() => {
    let list = [...allContents];

    if (sourceFilter !== '전체') {
      list = list.filter((item) => item.source === sourceFilter);
    }

    if (sort === 'latest') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sort === 'name') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko-KR'));
    }

    return list;
  }, [allContents, sourceFilter, sort]);

  const clearCollectionFilter = () => {
    router.push('/content');
  };

  const handleDelete = async (id) => {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까?')) return;
    try {
      await deleteContent(id);
      setAllContents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
    setGridMenuId(null);
  };

  const hasContents = items.length > 0;

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[440px] px-4 py-6">
        <div className="animate-pulse rounded-2xl bg-white p-8 text-center text-sm text-slate-400">
          불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[440px]">
      <PageHeader
        title="콘텐츠 목록"
        rightContent={
          <Link href="/search" className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1.5">
            <Search size={16} />
          </Link>
        }
      >
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 rounded-l-xl px-3 py-2 text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-600'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1">
                <LayoutGrid size={14} />
                앨범형
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 rounded-r-xl px-3 py-2 text-xs font-semibold ${
                viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-600'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1">
                <List size={14} />
                리스트형
              </span>
            </button>
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                정렬: {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sourceFilters.map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                sourceFilter === source
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </PageHeader>

      {activeCollection && (
        <div className="mb-3 mt-4 flex items-center gap-2 px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            {activeCollection.name}
          </span>
          <button
            onClick={clearCollectionFilter}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <X size={12} />
            필터 해제
          </button>
        </div>
      )}

      <div className="mb-3 mt-4 flex items-center justify-between px-4 text-xs text-slate-500">
        <p>총 {items.length}개</p>
      </div>

      {!hasContents && (
        <section className="mx-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {activeCollection ? `'${activeCollection.name}' 컬렉션은 비어 있어요` : '저장된 콘텐츠가 없어요'}
        </section>
      )}

      {hasContents && viewMode === 'grid' && (
        <section className="grid grid-cols-2 gap-3 px-4">
          {items.map((item) => {
            const title = item.title || '제목 없음';
            const sourceName = item.source || 'Other';
            const source = getSourceMeta(sourceName);
            const color = COLOR_TAGS[item.color_tag] || COLOR_TAGS.Gray;
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
              >
                <Link href={`/content/${item.id}`}>
                  <div className="aspect-square bg-slate-100">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500">
                        {title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className={`rounded-full px-2 py-0.5 text-[10px] ${source.badge}`}>{sourceName}</p>
                      <span className={`ml-2 h-2.5 w-2.5 rounded-full ${color.dot}`} aria-hidden />
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGridMenuId(gridMenuId === item.id ? null : item.id);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-slate-600 shadow-sm backdrop-blur hover:bg-white"
                  aria-label="더보기"
                >
                  <MoreHorizontal size={16} />
                </button>
                {gridMenuId === item.id && (
                  <div className="absolute right-2 top-10 z-10 w-32 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <Link
                      href={`/content/${item.id}`}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <PencilLine size={12} />
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={12} />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {hasContents && viewMode === 'list' && (
        <section className="space-y-2 px-4">
          {items.map((item) => (
            <SwipeableListItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </section>
      )}

      {gridMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setGridMenuId(null)} />
      )}
    </main>
  );
}

function SwipeableListItem({ item, onDelete }) {
  const safeItem = item || {};
  const title = safeItem.title || '제목 없음';
  const sourceName = safeItem.source || 'Other';
  const source = getSourceMeta(sourceName);
  const color = COLOR_TAGS[safeItem.color_tag] || COLOR_TAGS.Gray;
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);

  const THRESHOLD = 60;

  const handleTouchStart = useCallback((e) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const diff = startXRef.current - e.touches[0].clientX;
    currentXRef.current = diff;
    if (diff > 0) {
      setOffset(Math.min(diff, 140));
    } else if (showActions) {
      setOffset(Math.max(140 + diff, 0));
    }
  }, [showActions]);

  const handleTouchEnd = useCallback(() => {
    if (currentXRef.current > THRESHOLD) {
      setOffset(140);
      setShowActions(true);
    } else {
      setOffset(0);
      setShowActions(false);
    }
  }, []);

  const closeActions = () => {
    setOffset(0);
    setShowActions(false);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <Link
          href={`/content/${item.id}`}
          className="flex w-[70px] items-center justify-center bg-indigo-500 text-white"
          onClick={closeActions}
        >
          <div className="flex flex-col items-center gap-1">
            <PencilLine size={16} />
            <span className="text-[10px] font-semibold">수정</span>
          </div>
        </Link>
        <button
          onClick={() => { onDelete(); closeActions(); }}
          className="flex w-[70px] items-center justify-center bg-rose-500 text-white"
        >
          <div className="flex flex-col items-center gap-1">
            <Trash2 size={16} />
            <span className="text-[10px] font-semibold">삭제</span>
          </div>
        </button>
      </div>

      <Link
        href={`/content/${item.id}`}
        className="relative flex items-start gap-3 border border-white bg-white p-3 transition-transform"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {safeItem.thumbnail_url ? (
            <img src={safeItem.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg font-bold text-slate-500">
              {title.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {sourceName} · {shortDate(safeItem.created_at || new Date(0))}
          </p>
          {safeItem.memo && <p className="mt-1 line-clamp-1 text-xs text-slate-400">{safeItem.memo}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${source.badge}`}>{sourceName}</span>
          <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} aria-hidden />
        </div>
      </Link>
    </div>
  );
}
