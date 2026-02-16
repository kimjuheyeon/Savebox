'use client';

export default function ShareExtensionPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] items-center justify-center px-4">
        <div className="w-full rounded-[8px] border border-white/20 bg-white/10 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-300">Share Extension</p>
          <h1 className="mt-2 text-2xl font-bold text-white">프로토타입 이동됨</h1>
          <p className="mt-2 text-sm text-slate-200">
            기존 share-extension 페이지는 호환 경로 충돌이 있어 `/share`로 분리했습니다.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex rounded-[8px] border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-100"
          >
            메인 앱으로 이동
          </a>
        </div>
      </div>
    </main>
  );
}
