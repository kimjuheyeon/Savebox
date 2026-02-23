'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, LayoutGrid, Loader2, List, MoreHorizontal, PencilLine, Plus, Search, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { SNS_SOURCES, getSourceMeta, shortDate } from '@/lib/prototypeData';
import { Button } from '@/components/ui/button';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';
import { fetchContents, fetchCollections, createContent, deleteContent } from '@/lib/api';
import { getGuestContents, clearGuestContents, GUEST_LIMIT } from '@/lib/guestStorage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import GoogleMaterialButton from '@/components/GoogleMaterialButton';

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
          <div className="animate-pulse rounded-2xl bg-[#1E1E1E] p-8 text-center text-sm text-[#616161]">
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

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('savebox_view_mode') || 'list';
    }
    return 'list';
  });

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('savebox_view_mode', mode);
  };
  const [sort, setSort] = useState('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('전체');
  const [gridMenuId, setGridMenuId] = useState(null);
  const [allContents, setAllContents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSource, setNewSource] = useState('Other');
  const [newMemo, setNewMemo] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newCollectionId, setNewCollectionId] = useState('');
  const [creating, setCreating] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const fetchedUrlRef = useRef('');

  useEffect(() => {
    if (searchParams?.get?.('add') === 'true') {
      setShowCreate(true);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const guest = !session?.user?.id;
        setIsGuest(guest);

        // 로그인 직후 게스트 데이터 마이그레이션
        if (!guest) {
          const guestItems = getGuestContents();
          if (guestItems.length > 0) {
            // 즉시 localStorage를 비워서 중복 실행 방지
            clearGuestContents();
            const userId = session.user.id;
            const rows = guestItems.map((item) => ({
              user_id: userId,
              title: item.title,
              url: item.url,
              thumbnail_url: item.thumbnail_url || null,
              memo: item.memo || null,
              source: item.source || 'Other',
            }));
            const { error: migrateError } = await supabase
              .from('contents')
              .insert(rows);
            if (migrateError) {
              // 실패 시 게스트 데이터 복원
              localStorage.setItem('savebox_guest_contents', JSON.stringify(guestItems));
            }
          }
        }

        const [contentsResult, cols] = await Promise.all([
          fetchContents({ collectionId: collectionParam || undefined }),
          fetchCollections(),
        ]);
        setAllContents(contentsResult.contents);
        setCollections(cols);

        if (guest) {
          setGuestCount(getGuestContents().length);
        }
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

  const handleGoogleSignIn = async () => {
    setNudgeLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const explicitBase = process.env.NEXT_PUBLIC_SITE_URL;
      const base = (explicitBase || window.location.origin).replace(/\/$/, '');
      const redirectTo = `${base}/auth/callback?mode=signin&provider=google`;
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    } catch {
      setNudgeLoading(false);
    }
  };

  const clearCollectionFilter = () => {
    router.push('/content');
  };

  const handleDelete = async (id) => {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까?')) return;
    try {
      await deleteContent(id);
      setAllContents((prev) => prev.filter((item) => item.id !== id));
      if (isGuest) {
        setGuestCount(getGuestContents().length);
      }
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
    setGridMenuId(null);
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewUrl('');
    setNewSource('Other');
    setNewMemo('');
    setNewThumbnail('');
    setNewCollectionId('');
    setShowCreate(false);
    fetchedUrlRef.current = '';
  };

  const detectSourceFromUrl = (url) => {
    try {
      const hostname = new URL(url).hostname;
      if (/youtube\.com|youtu\.be/i.test(hostname)) return 'YouTube';
      if (/instagram\.com/i.test(hostname)) return 'Instagram';
      if (/(^|\.)x\.com|twitter\.com/i.test(hostname)) return 'X';
      if (/pinterest\.com|pin\.it/i.test(hostname)) return 'Pinterest';
      if (/tiktok\.com/i.test(hostname)) return 'TikTok';
      if (/threads\.net|threads\.com/i.test(hostname)) return 'Threads';
    } catch {}
    return 'Other';
  };

  const fetchOgMeta = async (url) => {
    const trimmed = url.trim();
    if (!trimmed || fetchedUrlRef.current === trimmed) return;
    fetchedUrlRef.current = trimmed;
    setFetching(true);

    // URL에서 출처 즉시 감지
    const detectedSource = detectSourceFromUrl(trimmed);
    if (detectedSource !== 'Other') setNewSource(detectedSource);

    try {
      // 서버 API 시도
      const res = await fetch('/api/og-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.ok) {
        const meta = await res.json();
        const isGenericTitle = /\(@[\w.]+\)/.test(meta.title || '')
          || /^(YouTube|Instagram|TikTok|Pinterest|Threads|X|Twitter)$/i.test((meta.title || '').trim());
        const betterTitle = (isGenericTitle && meta.description) ? meta.description.slice(0, 80) : meta.title;
        if (betterTitle && !newTitle) setNewTitle(betterTitle);
        if (meta.source) setNewSource(meta.source);
        if (meta.thumbnailUrl) setNewThumbnail(meta.thumbnailUrl);
        if (meta.url) setNewUrl(meta.url);
        setFetching(false);
        return;
      }
    } catch {
      // 서버 API 없음 (GitHub Pages 등) → 클라이언트 fallback
    }

    // 클라이언트 fallback: YouTube oEmbed
    if (detectedSource === 'YouTube') {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.title && !newTitle) setNewTitle(data.title);
          if (data.thumbnail_url) setNewThumbnail(data.thumbnail_url);
        }
      } catch {}
    }

    setFetching(false);
  };

  const handleUrlPaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    if (pasted.trim()) {
      setTimeout(() => fetchOgMeta(pasted.trim()), 100);
    }
  };

  const handleCreate = async () => {
    const finalUrl = newUrl.trim();
    if (!finalUrl) return;

    if (isGuest && guestCount >= GUEST_LIMIT) {
      resetCreateForm();
      setShowLoginNudge(true);
      return;
    }

    const finalTitle = newTitle.trim() || finalUrl;
    setCreating(true);
    try {
      const created = await createContent({
        title: finalTitle,
        url: finalUrl,
        source: newSource,
        memo: newMemo.trim() || null,
        thumbnailUrl: newThumbnail || null,
        collectionId: newCollectionId || null,
      });
      setAllContents((prev) => [created, ...prev]);
      if (isGuest) {
        const newCount = guestCount + 1;
        setGuestCount(newCount);
        resetCreateForm();
        if (newCount >= GUEST_LIMIT) {
          setShowLoginNudge(true);
        }
      } else {
        resetCreateForm();
      }
    } catch (err) {
      if (err.code === 'GUEST_LIMIT') {
        resetCreateForm();
        setShowLoginNudge(true);
      } else {
        alert('콘텐츠 추가에 실패했습니다.');
      }
    } finally {
      setCreating(false);
    }
  };

  const hasContents = items.length > 0;

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[440px] px-4 py-6">
        <div className="animate-pulse rounded-2xl bg-[#1E1E1E] p-8 text-center text-sm text-[#616161]">
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
          <Link
            href="/search"
            className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-lg border border-[#323232] text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]`}
          >
            <Search size={ICON_BUTTON_ICON_SIZE} />
          </Link>
        }
      >
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center rounded-xl border border-[#323232] bg-[#1E1E1E]">
            <button
              onClick={() => changeViewMode('grid')}
              className={`flex-1 rounded-l-xl px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-[#ffffff] text-[#111111]' : 'text-[#777777] hover:bg-[#282828] active:bg-[#333333]'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1">
                <LayoutGrid size={14} />
                앨범형
              </span>
            </button>
            <button
              onClick={() => changeViewMode('list')}
              className={`flex-1 rounded-r-xl px-3 py-2 text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-[#ffffff] text-[#111111]' : 'text-[#777777] hover:bg-[#282828] active:bg-[#333333]'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1">
                <List size={14} />
                리스트형
              </span>
            </button>
          </div>

          <div className="relative flex items-center justify-end">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-[#777777] transition hover:text-slate-300"
            >
              <ArrowUpDown size={12} />
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-xl border border-[#323232] bg-[#1E1E1E] py-1 shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                      className={`flex w-full items-center px-3 py-2 text-xs font-semibold transition hover:bg-[#282828] ${
                        sort === opt.value ? 'text-[#3385FF]' : 'text-[#777777]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sourceFilters.map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                sourceFilter === source
                  ? 'border-[#3385FF] bg-indigo-950/50 text-[#3385FF] active:bg-indigo-900'
                  : 'border-[#323232] text-[#777777] hover:bg-[#212b42] active:bg-[#283350]'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </PageHeader>

      {activeCollection && (
        <div className="mb-3 mt-4 flex items-center gap-2 px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3385FF]/30 bg-indigo-950/50 px-3 py-1.5 text-xs font-semibold text-[#3385FF]">
            {activeCollection.name}
          </span>
          <button
            onClick={clearCollectionFilter}
            className="inline-flex items-center gap-1 rounded-full border border-[#323232] px-2.5 py-1.5 text-xs font-semibold text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]"
          >
            <X size={12} />
            필터 해제
          </button>
        </div>
      )}

      <div className="mb-3 mt-4 flex items-center justify-between px-4 text-xs text-[#777777]">
        <p>총 {items.length}개</p>
      </div>

      {!hasContents && (
        <section className="mx-4 rounded-2xl border border-dashed border-[#323232] bg-[#1E1E1E] p-8 text-center text-sm text-[#777777]">
          {activeCollection ? `'${activeCollection.name}' 컬렉션은 비어 있어요` : '저장된 콘텐츠가 없어요'}
        </section>
      )}

      {hasContents && viewMode === 'grid' && (
        <section className="grid grid-cols-2 gap-3 px-4">
          {items.map((item) => {
            const title = item.title || '제목 없음';
            const sourceName = item.source || 'Other';
            const source = getSourceMeta(sourceName);
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-[#323232] bg-[#1E1E1E] shadow-sm"
              >
                <Link href={`/content/${item.id}`}>
                  <div className="aspect-square bg-[#353535]">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-3">
                        {source.iconSrc ? (
                          <img src={source.iconSrc} alt={sourceName} className="h-8 w-8 object-contain opacity-60" />
                        ) : (
                          <span className="text-2xl font-black text-[#616161]">{sourceName.charAt(0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-100">{title}</p>
                    <div className="mt-2">
                      <p className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${source.badge}`}>{sourceName}</p>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setGridMenuId(gridMenuId === item.id ? null : item.id)}
                  className="absolute right-2 top-2 z-[5] rounded-full bg-black/60 p-1.5 text-[#777777] shadow-sm backdrop-blur transition hover:bg-black/80 active:bg-black/90"
                  aria-label="더보기"
                >
                  <MoreHorizontal size={16} />
                </button>
                {gridMenuId === item.id && (
                  <div className="absolute right-2 top-10 z-10 w-32 rounded-xl border border-[#323232] bg-[#1E1E1E] py-1 shadow-lg">
                    <Link
                      href={`/content/${item.id}?edit=true`}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]"
                    >
                      <PencilLine size={12} />
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 transition hover:bg-rose-950/30 active:bg-rose-950/50"
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

      {/* FAB */}
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 z-20 w-full max-w-[440px] -translate-x-1/2"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 32px)' }}
      >
        <div className="flex flex-col items-end gap-2 px-4">
          {isGuest && (
            <button
              type="button"
              onClick={() => setShowLoginNudge(true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[#3385FF]/40 bg-[#101010]/90 px-3 py-1.5 text-xs font-semibold text-[#3385FF] shadow backdrop-blur transition hover:bg-[#1a2a4a] active:bg-[#1f3060]"
            >
              <span className="text-slate-400">무료 저장</span>
              <span>{guestCount}/{GUEST_LIMIT}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (isGuest && guestCount >= GUEST_LIMIT) {
                setShowLoginNudge(true);
              } else {
                setShowCreate(true);
              }
            }}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#3385FF] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#2f78f0] active:bg-[#2669d9]"
          >
            <Plus size={16} />
            새 콘텐츠 추가
          </button>
        </div>
      </div>

      {/* 로그인 유도 바텀시트 */}
      {showLoginNudge && (
        <>
          <div onClick={() => setShowLoginNudge(false)} className="fixed inset-0 z-30 bg-black/60" />
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
            <div
              className="rounded-t-2xl border border-[#323232] bg-[#1E1E1E] p-6 shadow-2xl"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mb-5 flex justify-end">
                <button
                  onClick={() => setShowLoginNudge(false)}
                  className="rounded-[8px] p-1.5 text-[#777777] transition hover:bg-[#282828]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mb-6 text-center">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3385FF]/15 text-3xl">
                  📦
                </div>
                <h2 className="text-lg font-bold text-slate-100">
                  무료 저장 {GUEST_LIMIT}개를 모두 사용했어요
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#777777]">
                  로그인하면 SaveBox를 무제한으로<br />자유롭게 사용할 수 있어요.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15 px-4 py-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">✓</span>
                  <p className="text-[13px] font-medium text-emerald-400">저장한 콘텐츠는 로그인 시 자동으로 옮겨져요</p>
                </div>
              </div>
              <GoogleMaterialButton
                onClick={handleGoogleSignIn}
                disabled={nudgeLoading}
                isLoading={nudgeLoading}
                label="Sign in with Google"
              />
              <button
                onClick={() => setShowLoginNudge(false)}
                className="mt-3 w-full py-2.5 text-sm font-semibold text-[#616161] transition hover:text-[#999999]"
              >
                나중에
              </button>
            </div>
          </div>
        </>
      )}

      {/* 콘텐츠 추가 바텀시트 */}
      {showCreate && (
        <>
          <div onClick={resetCreateForm} className="fixed inset-0 z-30 bg-black/60" />
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
            <div
              className="rounded-t-2xl border border-[#323232] bg-[#1E1E1E] p-4 shadow-2xl overflow-y-auto"
              style={{ maxHeight: 'min(75vh, 75dvh)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={resetCreateForm}
                  className="rounded-[8px] p-2 text-[#777777] transition hover:bg-[#1f2a42] active:bg-[#2a3652]"
                >
                  <X size={20} />
                </button>
                <h2 className="text-sm font-bold text-slate-100">콘텐츠 추가</h2>
                <div className="w-9" />
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">URL 붙여넣기</span>
                  <div className="relative">
                    <input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      onPaste={handleUrlPaste}
                      onBlur={() => newUrl.trim() && fetchOgMeta(newUrl)}
                      placeholder="https://... 링크를 붙여넣으세요"
                      type="url"
                      autoFocus
                      className="h-11 w-full rounded-xl border border-[#323232] bg-[#1E1E1E] px-3 text-sm text-slate-100 placeholder:text-[#616161] outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 pr-9"
                    />
                    {fetching ? (
                      <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-400" />
                    ) : newUrl && (
                      <button type="button" onClick={() => { setNewUrl(''); setNewThumbnail(''); setNewTitle(''); setNewSource('Other'); }} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#616161] hover:text-slate-100 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </label>

                {fetching && (
                  <div className="rounded-xl bg-indigo-950/50 px-3 py-2 text-xs text-indigo-300">
                    메타데이터를 가져오는 중...
                  </div>
                )}

                {newThumbnail && (
                  <div className="overflow-hidden rounded-xl border border-[#323232]">
                    <img
                      src={newThumbnail}
                      alt="미리보기"
                      referrerPolicy="no-referrer"
                      className="h-32 w-full object-cover"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; setNewThumbnail(''); }}
                    />
                  </div>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">
                    콘텐츠 이름 <span className="font-normal text-[#616161]">(비워두면 자동 설정)</span>
                  </span>
                  <div className="relative">
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={fetching ? '자동으로 가져오는 중...' : '저장할 콘텐츠의 제목을 입력하세요'}
                      maxLength={80}
                      className="h-11 w-full rounded-xl border border-[#323232] bg-[#1E1E1E] px-3 pr-9 text-sm text-slate-100 placeholder:text-[#616161] outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    />
                    {newTitle && (
                      <button type="button" onClick={() => setNewTitle('')} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#616161] hover:text-slate-100 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">
                    출처 <span className="font-normal text-[#616161]">(자동 감지)</span>
                  </span>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-[#323232] bg-[#1E1E1E] px-3 pr-8 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
                  >
                    {SNS_SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">컬렉션</span>
                  <select
                    value={newCollectionId}
                    onChange={(e) => setNewCollectionId(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-[#323232] bg-[#1E1E1E] px-3 pr-8 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
                  >
                    <option value="">미분류</option>
                    {collections.filter((c) => !c.is_system).map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">메모</span>
                  <div className="relative">
                    <textarea
                      value={newMemo}
                      onChange={(e) => setNewMemo(e.target.value)}
                      placeholder="메모를 입력하세요"
                      maxLength={500}
                      className="h-24 w-full resize-none rounded-xl border border-[#323232] bg-[#1E1E1E] px-3 pr-9 py-2.5 text-sm text-slate-100 placeholder:text-[#616161] outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    />
                    {newMemo && (
                      <button type="button" onClick={() => setNewMemo('')} className="absolute right-3 top-3 flex items-center justify-center text-[#616161] hover:text-slate-100 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </label>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!newUrl.trim() || creating || fetching}
                className="mt-4 w-full bg-[#3385FF] py-3 text-sm font-bold text-white hover:bg-[#2f78f0] active:bg-[#2669d9] disabled:bg-indigo-900 disabled:text-indigo-600"
              >
                {creating ? '추가 중...' : '추가'}
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function SwipeableListItem({ item, onDelete }) {
  const safeItem = item || {};
  const title = safeItem.title || '제목 없음';
  const sourceName = safeItem.source || 'Other';
  const source = getSourceMeta(sourceName);
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
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-[#323232] bg-[#1E1E1E]"
    >
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <Link
          href={`/content/${item.id}`}
          className="flex w-[70px] items-center justify-center bg-[#3385FF] text-white transition hover:bg-[#2f78f0] active:bg-[#2669d9]"
          onClick={closeActions}
        >
          <div className="flex flex-col items-center gap-1">
            <PencilLine size={16} />
            <span className="text-[10px] font-semibold">수정</span>
          </div>
        </Link>
        <button
          onClick={() => { onDelete(); closeActions(); }}
          className="flex w-[70px] items-center justify-center bg-rose-600 text-white transition hover:bg-rose-500 active:bg-rose-400"
        >
          <div className="flex flex-col items-center gap-1">
            <Trash2 size={16} />
            <span className="text-[10px] font-semibold">삭제</span>
          </div>
        </button>
      </div>

      <Link
        href={`/content/${item.id}`}
        className="relative flex w-full items-start gap-3 bg-[#1E1E1E] p-3 transition-transform"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#353535]">
          {safeItem.thumbnail_url ? (
            <img src={safeItem.thumbnail_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-1">
              {source.iconSrc ? (
                <img src={source.iconSrc} alt={sourceName} className="h-6 w-6 object-contain opacity-60" />
              ) : (
                <span className="text-lg font-black text-[#616161]">{sourceName.charAt(0)}</span>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-100">{title}</p>
          <p className="mt-0.5 text-xs text-[#777777]">
            {sourceName} · {shortDate(safeItem.created_at || new Date(0))}
          </p>
        </div>

      </Link>
    </div>
  );
}
