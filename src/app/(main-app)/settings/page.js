'use client';

import { ChevronRight, Info, LogOut, User } from 'lucide-react';
import ListItem from '@/components/ListItem';
import PageHeader from '@/components/PageHeader';

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-[440px] pb-10">
      <PageHeader title="설정" />

      <section className="mb-4 px-4 pt-4">
        <h2 className="mb-2 px-2 text-sm font-bold text-slate-700">계정</h2>
        <div className="rounded-[8px] border border-white bg-white shadow-sm">
          <ListItem
            title={<span className="font-semibold text-slate-900">현재 계정: 김개발</span>}
            subtitle="로그인 상태 유지중"
            leading={<div className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-100 text-slate-700"><User size={16} /></div>}
            trailing={<span className="text-xs font-semibold text-slate-500">오픈 베타</span>}
          />
          <button className="w-full rounded-[8px] rounded-t-none border-t border-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <span className="inline-flex items-center gap-2">
              <LogOut size={16} />
              로그아웃
            </span>
          </button>
        </div>
      </section>

      <section className="mb-4 px-4">
        <h2 className="mb-2 px-2 text-sm font-bold text-slate-700">저장 설정</h2>
        <div className="overflow-hidden rounded-[8px] border border-white bg-white shadow-sm">
          <ListItem
            leading={<div className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-100 text-slate-700"><User size={16} /></div>}
            title="기본 컬렉션"
            subtitle="맥락 1 저장 콘텐츠의 기본 수신 폴더"
            trailing={<span className="text-xs font-semibold text-slate-500">저장됨</span>}
          />
        </div>
      </section>

      <section className="px-4">
        <h2 className="mb-2 px-2 text-sm font-bold text-slate-700">앱 정보</h2>
        <div className="overflow-hidden rounded-[8px] border border-white bg-white shadow-sm">
          <ListItem
            leading={<div className="grid h-8 w-8 place-items-center rounded-[8px] bg-slate-100 text-slate-700"><Info size={16} /></div>}
            title="버전"
            subtitle="SaveBox v1.0.3"
            trailing={<span className="text-xs font-semibold text-slate-500">Build 2026.02.16</span>}
          />
          <button className="w-full rounded-[8px] rounded-t-none border-t border-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <span className="inline-flex items-center justify-between gap-2">
              이용약관
              <ChevronRight size={14} className="text-slate-300" />
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
