import Link from 'next/link';

/**
 * ListItem
 * required:
 *   - title
 * optional:
 *   - href: 링크 사용
 *   - leading: 왼쪽 요소(아이콘/썸네일)
 *   - subtitle: 보조 텍스트
 *   - trailing: 오른쪽 요소
 *   - onClick: 클릭 핸들러
 *   - className: 추가 클래스
 * interaction:
 *   - href와 onClick는 함께 사용 가능
 *   - 모두 없으면 렌더링만 되는 표시 행
 */
export default function ListItem({ href, leading = null, title, subtitle = null, trailing = null, onClick, className = '' }) {
  const baseClass = `flex items-center gap-3 rounded-[8px] bg-white px-3 py-3 ${className}`;

  if (!title) {
    return null;
  }

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClass}>
        {leading}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
        {trailing}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${baseClass} ${onClick ? 'cursor-pointer' : 'cursor-default'} text-left`}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}
