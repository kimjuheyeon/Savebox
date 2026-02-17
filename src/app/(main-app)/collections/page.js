'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, FolderPlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ListItem from '@/components/ListItem';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';
import { COLOR_TAGS } from '@/lib/prototypeData';
import { fetchCollections, createCollection, deleteCollections } from '@/lib/api';

const COLOR_CHOICES = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Gray'];

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('Blue');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (err) {
        console.error('Collections load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userCollections = useMemo(() => collections.filter((c) => !c.is_system), [collections]);

  const listItems = useMemo(
    () =>
      collections.map((collection) => {
        const isSystem = collection.is_system;
        const count = collection.item_count || 0;
        const color = COLOR_TAGS[collection.color_tag] || COLOR_TAGS.Blue;

        return {
          id: collection.id,
          leading: (
            <div className="flex items-center gap-2">
              {editing && !isSystem ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedIds((prev) =>
                      prev.includes(collection.id)
                        ? prev.filter((value) => value !== collection.id)
                        : [...prev, collection.id],
                    );
                  }}
                  className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} shrink-0 rounded-[4px] border ${
                    selectedIds.includes(collection.id)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                  aria-label={`${collection.name} 선택`}
                >
                  {selectedIds.includes(collection.id) && <Check size={ICON_BUTTON_ICON_SIZE} />}
                </button>
              ) : null}
              <span
                className={`grid h-12 w-12 place-items-center rounded-[8px] bg-slate-50 text-2xl ${isSystem ? 'grayscale' : ''}`}
                aria-hidden
              >
                📁
              </span>
            </div>
          ),
          title: (
            <span className="flex items-center gap-2">
              {collection.name}
              {isSystem && (
                <span className="rounded-[8px] border border-slate-300 px-2 py-0.5 text-[10px] text-slate-500">
                  시스템
                </span>
              )}
            </span>
          ),
          subtitle: collection.description,
          trailing: (
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-700">{count}개</p>
              <span className={`h-2.5 w-2.5 rounded-[8px] ${color.dot}`} aria-hidden />
            </div>
          ),
          href: !editing ? `/content?collection=${collection.id}` : undefined,
        };
      }),
    [collections, editing, selectedIds],
  );

  const toggleEditing = () => {
    setEditing((prev) => !prev);
    setSelectedIds([]);
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed || isDuplicate(trimmed)) return;

    try {
      const newCol = await createCollection({ name: trimmed, colorTag: newColor });
      setCollections((prev) => [newCol, ...prev]);
      setNewName('');
      setNewColor('Blue');
      setCreating(false);
    } catch (err) {
      alert('컬렉션 생성에 실패했습니다.');
    }
  };

  const isDuplicate = (name) =>
    collections.some((col) => col.name.toLowerCase() === name.toLowerCase());

  const handleDelete = async () => {
    const removable = selectedIds.filter((id) => !collections.find((c) => c.id === id)?.is_system);

    if (removable.length === 0) {
      alert('시스템 컬렉션은 삭제할 수 없습니다.');
      return;
    }

    if (!confirm('선택한 컬렉션을 삭제할까요?\n\n포함된 콘텐츠는 미분류 상태가 됩니다.')) {
      return;
    }

    try {
      await deleteCollections(removable);
      setCollections((prev) => prev.filter((c) => !removable.includes(c.id)));
      setSelectedIds([]);
      setEditing(false);
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

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
    <main className="relative mx-auto w-full max-w-[440px]">
      <PageHeader
        title="컬렉션"
        backHref="/"
        rightContent={
          <>
            <button
              onClick={toggleEditing}
              className="rounded-[8px] border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {editing ? '완료' : '편집'}
            </button>
            <button className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50`}>
              <Search size={ICON_BUTTON_ICON_SIZE} />
            </button>
          </>
        }
      />

      <section className="space-y-2 px-4 pt-4">
        {listItems.map((item) => (
          <ListItem
            key={item.id}
            href={item.href}
            leading={item.leading}
            title={item.title}
            subtitle={item.subtitle}
            trailing={item.trailing}
          />
        ))}
      </section>

      {userCollections.length === 0 && !editing && !creating && (
        <section className="mx-4 mt-4 rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <FolderPlus size={32} className="mx-auto mb-3 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">아직 컬렉션이 없어요</p>
          <p className="mt-1 text-xs text-slate-500">첫 컬렉션을 만들어 콘텐츠를 정리해 보세요.</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={14} />
            첫 컬렉션 만들기
          </button>
        </section>
      )}

      {editing && (
        <div className="mx-4 mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">체크한 컬렉션 {selectedIds.length}개</p>
          <button
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
            className="rounded-[8px] bg-rose-500 px-3 py-2 text-xs font-semibold text-white disabled:bg-rose-200"
          >
            <span className="inline-flex items-center gap-1">
              <Trash2 size={12} />
              삭제
            </span>
          </button>
        </div>
      )}

      {!editing && (
        <button
          onClick={() => setCreating((prev) => !prev)}
          className="fixed right-4 z-30 inline-flex items-center gap-2 rounded-[8px] border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-lg min-h-[48px]"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Pencil size={16} /> 새 컬렉션 만들기
        </button>
      )}

      {creating && (
        <section className="mx-4 mt-4 space-y-3 rounded-[8px] border border-indigo-100 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">새 컬렉션 생성</h3>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">컬렉션명 (최대 30자)</label>
            <input
              value={newName}
              maxLength={30}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="예: UI 영감"
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            {newName.trim() && isDuplicate(newName.trim()) && (
              <p className="mt-1 text-xs text-rose-600">이미 같은 이름의 컬렉션이 있습니다.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-700">컬러 태그</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_CHOICES.map((color) => {
                const colorMeta = COLOR_TAGS[color];
                const active = color === newColor;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`rounded-[8px] border px-3 py-1 text-xs font-semibold ${
                      active ? 'border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-600'
                    } ${colorMeta.badge}`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <span className="inline-flex items-center gap-1">
                <X size={12} />
                취소
              </span>
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || isDuplicate(newName.trim())}
              className="flex-1 rounded-[8px] bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-indigo-300"
            >
              생성
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
