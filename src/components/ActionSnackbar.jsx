export default function ActionSnackbar({
  open,
  message,
  actionLabel = '앱 열기',
  onAction,
  actionHref,
  className = '',
}) {
  const onActionClick = (event) => {
    if (!onAction) return;
    event.preventDefault();
    onAction();
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-10 z-[70] px-4 transition-all duration-300 ease-out ${
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[8px]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-5 w-5 rounded-[8px] bg-green-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="truncate text-sm font-medium text-white">{message}</span>
        </div>
        {actionLabel && (onAction || actionHref) && (
          <>
            {actionHref ? (
              <a
                href={actionHref}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 ml-3 whitespace-nowrap"
              >
                {actionLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 ml-3 whitespace-nowrap"
              >
                {actionLabel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
