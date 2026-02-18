export function Label({ className = '', ...props }) {
  return (
    <label
      className={`text-sm font-medium text-[#777777] ${className}`}
      {...props}
    />
  );
}
