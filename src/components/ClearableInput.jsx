'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';

const ClearableInput = forwardRef(function ClearableInput(
  { value, onChange, className = '', ...rest },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        className={`w-full rounded-[8px] border border-[#323232] bg-[#1E1E1E] px-3 py-2.5 pr-9 text-sm text-slate-100 placeholder:text-[#616161] outline-none focus:border-[#3385FF] ${className}`}
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          style={{ width: 18, height: 18, minWidth: 18, minHeight: 18 }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-[#616161] text-[#1E1E1E] transition hover:bg-[#777777]"
          aria-label="입력 지우기"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
});

export default ClearableInput;
