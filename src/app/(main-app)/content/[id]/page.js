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
        <div className="animate-pulse rounded-2xl bg-white p-8 text-center text-sm text-slate-400">
          불러오는 중...
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="mx-auto w-full max-w-[440px] px-4 py-10">
        <h1 className="text-xl font-bold text-slate-900">콘텐츠를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-slate-500">ID가 존재하지 않거나 삭제된 항목입니다.</p>
        <Link href="/content" className="mt-4 inline-block rounded-[8px] border border-slate-200 px-4 py-2">
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
              className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] border border-slate-200`}
              aria-label="공유"
            >
              <Share2 size={ICON_BUTTON_ICON_SIZE} />
            </button>
            <div className="relative" ref={actionMenuRef}>
              <button
                onClick={() => setActionMenuOpen((prev) => !prev)}
                className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] border border-slate-200`}
                aria-label="더보기"
              >
                <MoreHorizontal size={ICON_BUTTON_ICON_SIZE} />
              </button>
              {actionMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-28 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-lg"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      setActionMenuOpen(false);
                      openEditorSheet();
                    }}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
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

      <section className="mx-4 mt-4 overflow-hidden rounded-[8px] border border-white bg-white">
        <div className="aspect-[16/9] bg-slate-100">
          {content.thumbnail_url ? (
            <img src={content.thumbnail_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-slate-200 text-5xl font-bold text-slate-600">
              {getInitial(safeTitle)}
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
            <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-900">{safeTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">컬렉션 태그: {linkedCollection?.name || '미분류'}</p>
            <p className={`mt-2 inline-flex items-center rounded-[8px] border px-2.5 py-1 text-xs ${color.badge}`}>
              <span className={`mr-1 h-2 w-2 rounded-[8px] ${color.dot}`} /> {content.color_tag || 'Gray'}
            </p>
          </div>

          <div className="rounded-[8px] border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">메모</p>
            <p className="mt-1 min-h-[48px] text-sm text-slate-700">
              {content.memo ? content.memo : <span className="text-slate-400">메모를 추가하세요</span>}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
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
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-indigo-600 px-4 py-3 font-semibold text-white"
            >
              <ExternalLink size={16} />
              원본 링크 열기
            </Link>
          </div>
          {deleted && (
            <p className="text-sm text-rose-600">삭제 처리가 진행 중입니다.</p>
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
          <div onClick={closeEditor} className="fixed inset-0 z-30 bg-black/45" />
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
            <div
              className="rounded-t-2xl border border-slate-200 bg-white p-4 shadow-2xl overflow-y-auto"
              style={{ height: 'min(70vh, 70dvh)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={closeEditor}
                  className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] text-slate-500`}
                >
                  <X size={ICON_BUTTON_ICON_SIZE} />
                </button>
                <h2 className="text-sm font-bold">콘텐츠 수정</h2>
                <button
                  onClick={handleSave}
                  disabled={!draftIsDirty || saving}
                  className="rounded-[8px] bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white disabled:bg-indigo-200"
                >
                  {saving ? '저장중...' : '저장'}
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">콘텐츠 이름</span>
                  <input
                    value={draft?.title || ''}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    maxLength={80}
                    className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">출처</span>
                  <select
                    value={draft?.source || 'Other'}
                    onChange={(event) => setDraft((prev) => ({ ...prev, source: event.target.value }))}
                    className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-sm"
                  >
                    {SNS_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">저장할 컬렉션</span>
                  <select
                    value={draft?.collectionId || ''}
                    onChange={(event) => setDraft((prev) => ({ ...prev, collectionId: event.target.value }))}
                    className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-sm"
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
                  <span className="mb-1 block text-xs font-semibold text-slate-600">
                    메모 (최대 500자)
                  </span>
                  <textarea
                    value={draft?.memo || ''}
                    maxLength={500}
                    onChange={(event) => setDraft((prev) => ({ ...prev, memo: event.target.value }))}
                    className="h-28 w-full resize-none rounded-[8px] border border-slate-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {(draft?.memo || '').length}/500
                  </p>
                </label>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700"
              >
                <AlertTriangle size={12} />
                명시적 저장 구조: 변경사항은 저장 버튼을 눌러야 반영돼요
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
