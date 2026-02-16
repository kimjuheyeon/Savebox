export function cn(...classes) {
  return classes
    .filter((value) => value && String(value).trim().length > 0)
    .join(' ');
}
