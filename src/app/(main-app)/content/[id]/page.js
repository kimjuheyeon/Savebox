'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Share2,
  PencilLine,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';
import ActionSnackbar from '@/components/ActionSnackbar';
import { COLOR_TAGS, SNS_SOURCES, getSourceMeta, getInitial, formatKoreanDate } from '@/lib/prototypeData';
import { Button } from '@/components/ui/button';
import { fetchContent, fetchCollections, updateContent, deleteContent } from '@/lib/api';

export default function ContentDetailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = params?.id || '';
  const [content, setContent] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const [contentData, cols] = await Promise.all([
          fetchContent(contentId),
          fetchCollections(),
        ]);
        setContent(contentData);
        setCollections(cols);
      } catch (err) {
        console.error('Content detail load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contentId]);

  const draftIsDirty = useMemo(() => {
    if (!content || !draft) return false;
    return (
      draft.title !== content.title ||
      draft.source !== content.source ||
      draft.memo !== (content.memo || '') ||
      draft.collectionId !== (content.collection_id || '')
    );
  }, [content, draft]);

  useEffect(() => {
    if (!content) return;
    setDraft({
      title: content.title,
      source: content.source,
      memo: content.memo || '',
      collectionId: content.collection_id || '',
    });
    if (searchParams?.get('edit') === 'true') {
      setOpenEditor(true);
    }
  }, [content, searchParams]);

  useEffect(() => {
    if (!snackbarMessage) return;
    const timeout = setTimeout(() => setSnackbarMessage(''), 3000);
    return () => clearTimeout(timeout);
  }, [snackbarMessage]);

  useEffect(() => {
    if (!actionMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, [actionMenuOpen]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[440px] px-4 py-10">
        <div className="animate-pulse rounded-2xl bg-[#1E1E1E] p-8 text-center text-sm text-[#616161]">
          불러오는 중...
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="mx-auto w-full max-w-[440px] px-4 py-10">
        <h1 className="text-xl font-bold text-slate-100">콘텐츠를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-[#777777]">ID가 존재하지 않거나 삭제된 항목입니다.</p>
        <Link href="/content" className="mt-4 inline-block rounded-[8px] border border-[#323232] px-4 py-2 text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]">
          목록으로 돌아가기
        </Link>
      </main>
    );
  }

  const safeTitle = content.title || '제목 없음';
  const safeSource = content.source || 'Other';
  const sourceMeta = getSourceMeta(safeSource);
  const color = COLOR_TAGS[content.color_tag] || COLOR_TAGS.Gray;
  const linkedCollection = collections.find((item) => item.id === content.collection_id);

  const openEditorSheet = () => {
    setOpenEditor(true);
    setSaving(false);
  };

  const closeEditor = () => {
    if (draftIsDirty && !confirm('변경 내용을 저장하지 않고 나가시겠습니까?')) {
      return;
    }
    setOpenEditor(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/content/${content.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, text: safeTitle, url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setSnackbarMessage('링크가 복사되었습니다.');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setSnackbarMessage('링크가 복사되었습니다.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setSnackbarMessage('공유를 할 수 없어요');
      }
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await updateContent(content.id, {
        title: draft.title,
        source: draft.source,
        memo: draft.memo,
        collectionId: draft.collectionId || null,
      });
      setContent(updated);
      setSnackbarMessage('저장됨');
      setOpenEditor(false);
    } catch (err) {
      setSnackbarMessage('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까?')) return;
    try {
      await deleteContent(content.id);
      setDeleted(true);
      setSnackbarMessage('삭제되었습니다.');
      setTimeout(() => router.replace('/content'), 600);
    } catch (err) {
      setSnackbarMessage('삭제에 실패했습니다.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[440px] pb-10">
      <PageHeader
        title="뒤로가기"
        backHref="/content"
        rightContent={
          <>
            <button
              onClick={handleShare}
              className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] border border-[#323232] text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]`}
              aria-label="공유"
            >
              <Share2 size={ICON_BUTTON_ICON_SIZE} />
            </button>
            <div className="relative" ref={actionMenuRef}>
              <button
                onClick={() => setActionMenuOpen((prev) => !prev)}
                className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] border border-[#323232] text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]`}
                aria-label="더보기"
              >
                <MoreHorizontal size={ICON_BUTTON_ICON_SIZE} />
              </button>
              {actionMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-28 overflow-hidden rounded-[8px] border border-[#323232] bg-[#1E1E1E] shadow-lg"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      setActionMenuOpen(false);
                      openEditorSheet();
                    }}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#777777] transition hover:bg-[#212b42] active:bg-[#283350]"
                  >
                    <PencilLine size={12} />
                    수정
                  </button>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      setActionMenuOpen(false);
                      handleDelete();
                    }}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-400 transition hover:bg-rose-950/30 active:bg-rose-950/50"
                  >
                    <Trash2 size={12} />
                    삭제
                  </button>
                </div>
              )}
            </div>
          </>
        }
      />

      <section className="mx-4 mt-4 overflow-hidden rounded-[8px] border border-[#323232] bg-[#1E1E1E]">
        <div className="aspect-[16/9] bg-[#1E1E1E]">
          {content.thumbnail_url ? (
            <img src={content.thumbnail_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#1E1E1E] p-6">
              {sourceMeta.iconSrc ? (
                <img src={sourceMeta.iconSrc} alt={safeSource} className="h-12 w-12 object-contain opacity-60" />
              ) : (
                <span className="text-4xl font-black text-[#616161]">{safeSource.charAt(0)}</span>
              )}
              <p className="line-clamp-2 text-center text-sm font-medium text-[#777777]">{safeTitle}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className={`inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold ${sourceMeta.badge}`}>
              {sourceMeta.iconSrc ? (
                <img src={sourceMeta.iconSrc} alt={`${safeSource} 아이콘`} className="h-4 w-4 rounded-[4px] object-contain" />
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] text-[9px] font-bold">
                  {safeSource.charAt(0)}
                </span>
              )}
              {safeSource}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-100">{safeTitle}</h1>
            <p className="mt-2 text-sm text-[#777777]">컬렉션 태그: {linkedCollection?.name || '미분류'}</p>
            <p className={`mt-2 inline-flex items-center rounded-[8px] border px-2.5 py-1 text-xs ${color.badge}`}>
              <span className={`mr-1 h-2 w-2 rounded-[8px] ${color.dot}`} /> {content.color_tag || 'Gray'}
            </p>
          </div>

          <div className="rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-3">
            <p className="text-xs font-semibold text-[#777777]">메모</p>
            <p className="mt-1 min-h-[48px] text-sm text-[#777777]">
              {content.memo ? content.memo : <span className="text-[#616161]">메모를 추가하세요</span>}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-[#777777]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={14} />
              저장일시: {content.created_at ? formatKoreanDate(content.created_at) : '-'}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={`h-2 w-2 rounded-[8px] ${sourceMeta.mark}`} />
              {content.url ? '원본 링크 가능' : '원본 없음'}
            </span>
          </div>

          <div className="space-y-3">
            <Link
              href={content.url || '#'}
              target="_blank"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#3385FF] px-4 py-3 font-semibold text-white transition hover:bg-[#2f78f0] active:bg-[#2669d9]"
            >
              <ExternalLink size={16} />
              원본 링크 열기
            </Link>
          </div>
          {deleted && (
            <p className="text-sm text-rose-400">삭제 처리가 진행 중입니다.</p>
          )}
        </div>
      </section>

      <ActionSnackbar
        open={Boolean(snackbarMessage)}
        message={snackbarMessage}
        actionLabel="목록으로 이동"
        actionHref="/content"
      />

      {openEditor && (
        <>
          <div onClick={closeEditor} className="fixed inset-0 z-30 bg-black/60" />
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
            <div
              className="rounded-t-2xl border border-[#323232] bg-[#1E1E1E] p-4 shadow-2xl overflow-y-auto"
              style={{ height: 'min(70vh, 70dvh)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={closeEditor}
                  className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] text-[#777777] transition hover:bg-[#1f2a42] active:bg-[#2a3652]`}
                >
                  <X size={ICON_BUTTON_ICON_SIZE} />
                </button>
                <h2 className="text-sm font-bold text-slate-100">콘텐츠 수정</h2>
                <div className="w-9" />
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">콘텐츠 이름</span>
                  <input
                    value={draft?.title || ''}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    maxLength={80}
                    className="w-full rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">출처</span>
                  <select
                    value={draft?.source || 'Other'}
                    onChange={(event) => setDraft((prev) => ({ ...prev, source: event.target.value }))}
                    className="w-full rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  >
                    {SNS_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">저장할 컬렉션</span>
                  <select
                    value={draft?.collectionId || ''}
                    onChange={(event) => setDraft((prev) => ({ ...prev, collectionId: event.target.value }))}
                    className="w-full rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="">미분류</option>
                    {collections.filter((c) => !c.is_system).map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#777777]">
                    메모 (최대 500자)
                  </span>
                  <textarea
                    value={draft?.memo || ''}
                    maxLength={500}
                    onChange={(event) => setDraft((prev) => ({ ...prev, memo: event.target.value }))}
                    className="h-28 w-full resize-none rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                  <p className="mt-1 text-right text-xs text-[#616161]">
                    {(draft?.memo || '').length}/500
                  </p>
                </label>
              </div>

              <Button
                onClick={handleSave}
                disabled={!draftIsDirty || saving}
                className="mt-4 w-full bg-[#3385FF] py-3 text-sm font-bold text-white hover:bg-[#2f78f0] active:bg-[#2669d9] disabled:bg-indigo-900 disabled:text-indigo-600"
              >
                {saving ? '저장중...' : '저장'}
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
