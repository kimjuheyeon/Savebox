import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <div className="mx-auto w-full max-w-[440px] px-4 py-7">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#777777] hover:text-[#ffffff]">
            <ArrowLeft size={16} />
            돌아가기
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}
