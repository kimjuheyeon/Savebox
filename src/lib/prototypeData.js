export const SNS_SOURCES = [
  'Instagram',
  'YouTube',
  'X',
  'Pinterest',
  'TikTok',
  'Threads',
  'Other',
];

export const SOURCE_META = {
  Instagram: {
    badge: 'border border-pink-200 bg-pink-100 text-pink-700',
    mark: 'bg-pink-500',
    iconSrc: '/Image/instagram.png',
  },
  YouTube: {
    badge: 'border border-rose-200 bg-rose-100 text-rose-700',
    mark: 'bg-rose-500',
    iconSrc: '/Image/youtube.png',
  },
  X: {
    badge: 'border border-slate-300 bg-slate-100 text-slate-700',
    mark: 'bg-slate-900',
    iconSrc: '/Image/x.png',
  },
  Pinterest: {
    badge: 'border border-orange-200 bg-orange-100 text-orange-700',
    mark: 'bg-orange-500',
    iconSrc: '/Image/pinterest.png',
  },
  TikTok: {
    badge: 'border border-slate-300 bg-slate-100 text-slate-800',
    mark: 'bg-black',
    iconSrc: '/Image/tiktok.png',
  },
  Threads: {
    badge: 'border border-cyan-200 bg-cyan-100 text-cyan-700',
    mark: 'bg-cyan-600',
    iconSrc: null,
  },
  Other: {
    badge: 'border border-gray-300 bg-gray-100 text-gray-700',
    mark: 'bg-gray-500',
    iconSrc: null,
  },
};

export const COLOR_TAGS = {
  Red: { label: 'Red', dot: 'bg-red-500', badge: 'border-red-200 text-red-700 bg-red-50' },
  Orange: { label: 'Orange', dot: 'bg-orange-500', badge: 'border-orange-200 text-orange-700 bg-orange-50' },
  Yellow: { label: 'Yellow', dot: 'bg-yellow-500', badge: 'border-yellow-200 text-yellow-700 bg-yellow-50' },
  Green: { label: 'Green', dot: 'bg-green-500', badge: 'border-green-200 text-green-700 bg-green-50' },
  Blue: { label: 'Blue', dot: 'bg-blue-500', badge: 'border-blue-200 text-blue-700 bg-blue-50' },
  Purple: { label: 'Purple', dot: 'bg-purple-500', badge: 'border-purple-200 text-purple-700 bg-purple-50' },
  Pink: { label: 'Pink', dot: 'bg-pink-500', badge: 'border-pink-200 text-pink-700 bg-pink-50' },
  Gray: { label: 'Gray', dot: 'bg-slate-500', badge: 'border-slate-200 text-slate-700 bg-slate-100' },
};

const makeDate = (daysAgo, hour, minute) => {
  const base = new Date();
  base.setDate(base.getDate() - daysAgo);
  base.setHours(hour ?? 9, minute ?? 0, 0, 0);
  return base;
};

export const MOCK_COLLECTIONS = [
  {
    id: 'all-items',
    name: '모든 항목',
    description: '저장한 모든 콘텐츠',
    icon: '📚',
    colorTag: 'Blue',
    isSystem: true,
  },
  {
    id: 'uncategorized',
    name: '저장됨',
    description: '기본 저장 컬렉션',
    icon: '💾',
    colorTag: 'Blue',
    isSystem: true,
  },
  {
    id: 'col-ui',
    name: 'UI 레퍼런스',
    description: '컴포넌트·디자인 영감',
    icon: '🧩',
    colorTag: 'Purple',
    isSystem: false,
  },
  {
    id: 'col-article',
    name: '개발 아티클',
    description: '학습용 글 모음',
    icon: '📄',
    colorTag: 'Green',
    isSystem: false,
  },
  {
    id: 'col-food',
    name: '맛집 리스트',
    description: '다음 방문할 곳',
    icon: '🍴',
    colorTag: 'Orange',
    isSystem: false,
  },
  {
    id: 'col-video',
    name: '나중에 볼 영상',
    description: '보관해 둔 동영상',
    icon: '🎬',
    colorTag: 'Red',
    isSystem: false,
  },
];

export const MOCK_CONTENTS = [
  {
    id: 'content-1',
    title: '디자인 시스템 구축 가이드',
    url: 'https://www.figma.com/resources/design-systems/',
    thumbnailUrl: '/thumbnail/2aca272e2362eaf5a34383381000c9a7.jpg',
    source: 'Instagram',
    collectionId: 'col-ui',
    colorTag: 'Green',
    memo: '버튼·타이포·간격 토큰을 한 파일로 정리할 때 쓰기 좋다.',
    createdAt: makeDate(0, 10, 14),
    updatedAt: makeDate(0, 10, 30),
    lastViewedAt: makeDate(0, 11, 0),
  },
  {
    id: 'content-2',
    title: '반응형 그리드 레이아웃 패턴 정리',
    url: 'https://ui-patterns.kr/responsive',
    source: 'YouTube',
    collectionId: 'col-ui',
    colorTag: 'Blue',
    memo: '12컬럼 구조, 모바일 브레이크포인트 우선 규칙 참고.',
    createdAt: makeDate(1, 16, 12),
    updatedAt: makeDate(1, 16, 12),
    lastViewedAt: makeDate(0, 14, 30),
  },
  {
    id: 'content-3',
    title: '컬러 팔레트 트렌드 2026',
    url: 'https://www.pinterest.com/search/pins/?q=color%20palette',
    thumbnailUrl: '/thumbnail/6912ebf347095999d3b8597ec1c0c887.jpg',
    source: 'Pinterest',
    collectionId: 'col-ui',
    colorTag: 'Orange',
    memo: '서브컬러 대비를 위해 회색과 보조색 조합이 핵심.',
    createdAt: makeDate(2, 11, 22),
    updatedAt: makeDate(2, 11, 22),
    lastViewedAt: makeDate(1, 9, 15),
  },
  {
    id: 'content-4',
    title: '개발 아티클: React 컴포넌트 분리 전략',
    url: 'https://www.youtube.com/watch?v=react-components',
    thumbnailUrl: '/thumbnail/d7316f9967030db54150c3bf12937544.jpg',
    source: 'YouTube',
    collectionId: 'col-article',
    colorTag: 'Purple',
    memo: '상태는 가능한 깊게 묶고, prop-drilling은 훅으로 정리.',
    createdAt: makeDate(3, 9, 18),
    updatedAt: makeDate(3, 9, 40),
    lastViewedAt: makeDate(0, 20, 0),
  },
  {
    id: 'content-5',
    title: '동작 트랜지션 10분 완성',
    url: 'https://x.com/example/transtions',
    source: 'X',
    collectionId: 'col-article',
    colorTag: 'Yellow',
    memo: '',
    createdAt: makeDate(4, 22, 14),
    updatedAt: makeDate(4, 22, 14),
    lastViewedAt: makeDate(3, 8, 0),
  },
  {
    id: 'content-6',
    title: '이번 주 파스타 맛집',
    url: 'https://www.instagram.com/explore/locations/pasta',
    thumbnailUrl: '/thumbnail/b1d0c3bfdcd04d80dd8fde350cdf2946.jpg',
    source: 'Instagram',
    collectionId: 'col-food',
    colorTag: 'Red',
    memo: '예약은 주말 1부 선착순, 1인 기준 2만 포인트대.',
    createdAt: makeDate(4, 13, 8),
    updatedAt: makeDate(4, 13, 8),
    lastViewedAt: makeDate(2, 12, 0),
  },
  {
    id: 'content-7',
    title: '야식 리스트',
    url: 'https://www.instagram.com/explore/locations/yasik',
    source: 'Instagram',
    collectionId: 'col-food',
    colorTag: 'Yellow',
    memo: '',
    createdAt: makeDate(6, 17, 3),
    updatedAt: makeDate(6, 17, 3),
    lastViewedAt: makeDate(5, 19, 0),
  },
  {
    id: 'content-8',
    title: '주말에 보기 좋은 영상 모음',
    url: 'https://www.tiktok.com/discover/playlist',
    thumbnailUrl: '/thumbnail/dd1994d5301ea079533443fdf481775d.jpg',
    source: 'TikTok',
    collectionId: 'col-video',
    colorTag: 'Green',
    memo: '클립 분량 짧은 것부터 정렬 추천.',
    createdAt: makeDate(1, 20, 30),
    updatedAt: makeDate(1, 20, 30),
    lastViewedAt: makeDate(0, 22, 0),
  },
  {
    id: 'content-9',
    title: '드롭다운 접근성 체크리스트',
    url: 'https://www.threads.com/post/a11y-checklist',
    source: 'Threads',
    collectionId: 'col-article',
    colorTag: 'Blue',
    memo: '키보드 포커스와 aria-live는 꼭 챙길 것.',
    createdAt: makeDate(7, 15, 50),
    updatedAt: makeDate(7, 15, 50),
    lastViewedAt: makeDate(6, 10, 0),
  },
  {
    id: 'content-10',
    title: '영감이 되는 인터랙션 30선',
    url: 'https://www.figma.com/community',
    thumbnailUrl: '/thumbnail/6912ebf347095999d3b8597ec1c0c887.jpg',
    source: 'Other',
    collectionId: 'col-ui',
    colorTag: 'Purple',
    memo: '모션은 과하지 않게. 120ms 미만이면 반응이 부자연스럽지 않다.',
    createdAt: makeDate(5, 18, 10),
    updatedAt: makeDate(5, 18, 10),
    lastViewedAt: makeDate(4, 15, 0),
  },
  {
    id: 'content-11',
    title: '저번주에 본 아이디어 아카이브',
    url: 'https://example.com/idea-archive',
    source: 'Other',
    collectionId: 'uncategorized',
    colorTag: 'Gray',
    memo: '아직 카테고리 미정',
    createdAt: makeDate(8, 10, 5),
    updatedAt: makeDate(8, 10, 5),
    lastViewedAt: makeDate(7, 14, 0),
  },
];

export const getCollectionCountMap = () => {
  const map = Object.fromEntries(MOCK_COLLECTIONS.map((col) => [col.id, 0]));

  MOCK_CONTENTS.forEach((item) => {
    map[item.collectionId] = (map[item.collectionId] || 0) + 1;
  });

  return map;
};

export const getContentsByCollection = (collectionId) => {
  if (!collectionId || collectionId === 'all-items') return MOCK_CONTENTS;
  return MOCK_CONTENTS.filter((item) => item.collectionId === collectionId);
};

export const getSourceMeta = (source) => SOURCE_META[source] || SOURCE_META.Other;

export const getInitial = (value = '') =>
  value.trim().charAt(0).toUpperCase() || 'S';

export const formatKoreanDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));

export const shortDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

export const getRecentItems = (days = 7) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  return MOCK_CONTENTS.filter((item) => new Date(item.createdAt) >= threshold);
};
