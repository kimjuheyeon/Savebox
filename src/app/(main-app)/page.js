import Link from 'next/link';
import { Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ListItem from '@/components/ListItem';
import {
  MOCK_COLLECTIONS,
  getCollectionCountMap,
  getInitial,
  getRecentItems,
} from '@/lib/prototypeData';
import { ICON_BUTTON_BASE_CLASS, ICON_BUTTON_ICON_SIZE, ICON_BUTTON_SIZE_CLASS } from '@/lib/iconUI';

export default function MainDashboardPage() {
  const collections = getCollectionCountMap();
  const recentItems = getRecentItems(7).slice(0, 8);
  const topCollections = MOCK_COLLECTIONS.filter((col) => !col.isSystem).slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-[440px] min-h-screen">
      <PageHeader
        title="SaveBox"
        rightContent={
          <Link
            href="/search"
            className={`${ICON_BUTTON_BASE_CLASS} ${ICON_BUTTON_SIZE_CLASS} rounded-[8px] bg-slate-900 text-white`}
            aria-label="검색"
          >
            <Search size={ICON_BUTTON_ICON_SIZE} />
          </Link>
        }
      />

      <section className="mb-6 px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">최근 저장 항목</h2>
          <Link href="/content" className="text-sm font-medium text-indigo-600">
            전체보기
          </Link>
        </div>

        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto pb-1">
          {recentItems.length === 0 && (
            <div className="w-full rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              아직 저장된 콘텐츠가 없어요
            </div>
          )}
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href={`/content/${item.id}`}
              className="w-36 shrink-0 rounded-[8px] border border-white bg-white p-2.5 shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden rounded-[8px] bg-slate-100">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                    {getInitial(item.title)}
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.source}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">컬렉션</h2>
          <Link href="/collections" className="text-sm font-semibold text-indigo-600">
            더보기
          </Link>
        </div>

        <div className="space-y-2">
          {topCollections.map((collection) => (
            <ListItem
              key={collection.id}
              href={`/content?collection=${collection.id}`}
              leading={
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-slate-100 text-lg">
                  {collection.icon}
                </div>
              }
              title={collection.name}
              subtitle={collection.description}
              trailing={
                <p className="text-sm font-semibold text-slate-700">{collections[collection.id] || 0}개</p>
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
