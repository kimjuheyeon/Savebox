import '@/styles/globals.css';

export const metadata = {
  title: 'SaveBox Prototype',
  description: 'SNS 콘텐츠 통합 북마크 서비스 프로토타입',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
