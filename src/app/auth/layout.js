import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#F5F8FF]">
      <div className="mx-auto w-full max-w-[440px] px-4 py-7">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <ArrowLeft size={16} />
            돌아가기
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}
