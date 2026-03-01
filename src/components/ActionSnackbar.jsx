export default function ActionSnackbar({
  open,
  message,
  actionLabel = '앱 열기',
  onAction,
  actionHref,
  className = '',
  style = {},
}) {
  const onActionClick = (event) => {
    if (!onAction) return;
    event.preventDefault();
    onAction();
  };

  return (
    <div
      className={`fixed inset-x-0 z-[70] transition-all duration-300 ease-out ${
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      } ${className}`}
      style={{ bottom: 'calc(4rem + 32px + env(safe-area-inset-bottom, 0px))', ...style }}
    >
      <div className="mx-auto max-w-[440px] px-4">
        <div
          className="flex h-[52px] items-center justify-between gap-3 px-4 rounded-2xl shadow-lg border border-gray-200"
          style={{
            backgroundColor: '#ffffff',
          }}
        >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="truncate text-sm font-medium text-gray-900">{message}</span>
        </div>
        {actionLabel && (onAction || actionHref) && (
          <>
            {actionHref ? (
              <a
                href={actionHref}
                className="text-sm font-semibold shrink-0 ml-3 whitespace-nowrap flex items-center"
                style={{ color: 'rgb(47 120 240)' }}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                className="text-sm font-semibold shrink-0 ml-3 whitespace-nowrap flex items-center"
                style={{ color: 'rgb(47 120 240)' }}
              >
                {actionLabel}
              </button>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
