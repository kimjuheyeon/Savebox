const GUEST_KEY = 'savebox_guest_contents';
export const GUEST_LIMIT = 5;

export function getGuestContents() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addGuestContent(item) {
  const items = getGuestContents();
  if (items.length >= GUEST_LIMIT) {
    const err = new Error('게스트 저장 한도에 도달했습니다.');
    err.code = 'GUEST_LIMIT';
    throw err;
  }
  const newItem = {
    ...item,
    id: 'guest_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify([newItem, ...items]));
  return newItem;
}

export function removeGuestContent(id) {
  const items = getGuestContents().filter((i) => i.id !== id);
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function clearGuestContents() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_KEY);
}
