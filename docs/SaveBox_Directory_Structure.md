# SaveBox 프로젝트 디렉토리 구조 및 Git 전략

## 1. 프로젝트 구조 개요

SaveBox는 맥락 1(Share Extension)과 맥락 2(Save App)를 하나의 Next.js 프로젝트에서 관리하되, 명확하게 분리된 구조로 개발합니다.

### 1.1 전략 선택

**권장: 단일 모노레포 (Single Repository)**
- ✅ 공통 컴포넌트/타입/유틸 재사용 용이
- ✅ 데이터 모델 일관성 유지
- ✅ 배포 파이프라인 단순화
- ✅ 코드 리뷰 및 협업 효율성

**대안: 멀티 레포 (다음 경우에만 고려)**
- 맥락 1, 2의 배포 주기가 완전히 다를 때
- 팀이 완전히 분리되어 독립적으로 작업할 때
- 현재 프로젝트에는 비권장 ❌

## 2. 디렉토리 구조

```
savebox/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD 파이프라인
│       └── deploy.yml                # 배포 자동화
│
├── public/
│   ├── images/
│   │   └── default-screen.png        # 맥락 1 배경 이미지
│   ├── thumbnails/                   # 컬렉션 썸네일
│   └── icons/                        # 앱 아이콘, 파비콘
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (share-extension)/        # 맥락 1: Share Extension 그룹
│   │   │   ├── layout.tsx            # Share Extension 전용 레이아웃
│   │   │   ├── page.tsx              # S1-01: 진입 화면
│   │   │   └── components/
│   │   │       ├── ShareContentPreview.tsx      # S1-02
│   │   │       ├── ShareCollectionList.tsx      # S1-03
│   │   │       ├── ShareCreateCollection.tsx    # S1-04
│   │   │       ├── SaveSuccessSnackbar.tsx      # S1-05
│   │   │       └── AutoReturnHandler.tsx        # S1-06
│   │   │
│   │   ├── (main-app)/               # 맥락 2: Main App 그룹
│   │   │   ├── layout.tsx            # Main App 전용 레이아웃
│   │   │   ├── page.tsx              # A1-01: 홈/대시보드
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx          # A1-02: 컬렉션 관리
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # A1-03: 컬렉션별 콘텐츠 목록
│   │   │   ├── content/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # A1-04: 콘텐츠 상세
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # A1-05: 검색
│   │   │   └── settings/
│   │   │       └── page.tsx          # A1-06: 설정
│   │   │
│   │   ├── api/                      # API Routes (공통)
│   │   │   ├── contents/
│   │   │   │   ├── route.ts          # GET, POST /api/contents
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PATCH, DELETE /api/contents/:id
│   │   │   └── collections/
│   │   │       ├── route.ts          # GET, POST /api/collections
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET, PATCH, DELETE /api/collections/:id
│   │   │
│   │   └── layout.tsx                # 전역 레이아웃
│   │
│   ├── components/                   # 공통 컴포넌트
│   │   ├── ui/                       # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── content/                  # 콘텐츠 관련
│   │   │   ├── ContentCard.tsx       # 앨범형 카드
│   │   │   ├── ContentListItem.tsx   # 리스트형 항목
│   │   │   └── ContentThumbnail.tsx  # 썸네일 컴포넌트
│   │   └── collection/               # 컬렉션 관련
│   │       ├── CollectionCard.tsx
│   │       ├── CollectionModal.tsx
│   │       └── CollectionSelector.tsx
│   │
│   ├── lib/                          # 공통 라이브러리
│   │   ├── db/                       # 데이터베이스 (IndexedDB)
│   │   │   ├── index.ts              # Dexie 설정
│   │   │   ├── schema.ts             # DB 스키마
│   │   │   └── migrations.ts         # 마이그레이션
│   │   ├── api/                      # API 클라이언트
│   │   │   ├── contents.ts
│   │   │   └── collections.ts
│   │   ├── utils/                    # 유틸리티 함수
│   │   │   ├── date.ts               # 날짜 포맷팅
│   │   │   ├── url.ts                # URL 파싱
│   │   │   └── image.ts              # 이미지 처리
│   │   └── constants.ts              # 상수 정의
│   │
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── content.ts                # Content 인터페이스
│   │   ├── collection.ts             # Collection 인터페이스
│   │   └── common.ts                 # 공통 타입
│   │
│   ├── hooks/                        # Custom Hooks (공통)
│   │   ├── useContents.ts            # 콘텐츠 관리
│   │   ├── useCollections.ts         # 컬렉션 관리
│   │   ├── useSearch.ts              # 검색 기능
│   │   └── useLocalStorage.ts        # 로컬 저장소
│   │
│   └── styles/
│       └── globals.css               # 전역 스타일 (Tailwind)
│
├── docs/                             # 문서
│   ├── PRD_Share-Extension_v1_2.md   # 맥락 1 PRD
│   ├── PRD_SaveApp_v1.0.md           # 맥락 2 PRD
│   ├── API.md                        # API 명세
│   └── CONTRIBUTING.md               # 기여 가이드
│
├── tests/                            # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local.example                # 환경 변수 예시
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 3. 핵심 설계 원칙

### 3.1 Route Group 활용

Next.js App Router의 Route Group `(폴더명)` 기능을 사용하여 맥락 분리:

```typescript
// src/app/(share-extension)/layout.tsx
export default function ShareExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="share-extension-wrapper">
      {/* 맥락 1 전용 레이아웃 */}
      <div className="mobile-frame">
        {children}
      </div>
    </div>
  );
}

// src/app/(main-app)/layout.tsx
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main-app-wrapper">
      {/* 맥락 2 전용 레이아웃 (탭바 네비게이션 포함) */}
      <div className="app-container">
        {children}
        <TabNavigation />
      </div>
    </div>
  );
}
```

### 3.2 컴포넌트 명명 규칙

**맥락 1 (Share Extension):**
- 접두사: `Share` 사용
- 예: `ShareContentPreview`, `ShareCollectionList`

**맥락 2 (Main App):**
- 접두사: 일반 명사 사용
- 예: `ContentCard`, `CollectionManagement`

**공통:**
- `components/ui/`: 재사용 가능한 기본 UI
- `components/content/`, `components/collection/`: 도메인별 공통 컴포넌트

### 3.3 데이터 계층 공유

맥락 1, 2 모두 동일한 데이터 소스 사용:

```typescript
// src/lib/db/index.ts
import Dexie, { Table } from 'dexie';
import { Content, Collection } from '@/types';

class SaveBoxDB extends Dexie {
  contents!: Table<Content>;
  collections!: Table<Collection>;

  constructor() {
    super('SaveBoxDB');
    this.version(1).stores({
      contents: '++id, title, url, collectionId, createdAt',
      collections: '++id, name, createdAt',
    });
  }
}

export const db = new SaveBoxDB();
```

## 4. Git 브랜치 전략

### 4.1 브랜치 구조

```
main (프로덕션)
  │
  ├── develop (개발 통합)
  │     │
  │     ├── feature/context1-share-extension (맥락 1 기능 개발)
  │     │     ├── feature/context1-s1-01-entry
  │     │     ├── feature/context1-s1-02-preview
  │     │     └── feature/context1-s1-03-collection-list
  │     │
  │     ├── feature/context2-main-app (맥락 2 기능 개발)
  │     │     ├── feature/context2-a1-01-home
  │     │     ├── feature/context2-a1-02-collection-mgmt
  │     │     └── feature/context2-a1-03-content-library
  │     │
  │     ├── feature/common-components (공통 컴포넌트)
  │     │
  │     └── feature/db-schema (데이터 모델)
  │
  └── hotfix/* (긴급 수정)
```

### 4.2 브랜치 네이밍 규칙

**맥락 1 기능:**
```bash
feature/context1-{화면ID}-{기능명}
예: feature/context1-s1-02-content-preview
```

**맥락 2 기능:**
```bash
feature/context2-{화면ID}-{기능명}
예: feature/context2-a1-01-home-dashboard
```

**공통 기능:**
```bash
feature/common-{기능명}
예: feature/common-content-card
```

### 4.3 커밋 메시지 규칙

```
[맥락] 타입: 제목

본문 (선택사항)

Refs: #이슈번호
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: 스타일 변경
- `docs`: 문서 변경
- `test`: 테스트 추가/수정

**예시:**
```
[Context1] feat: S1-02 콘텐츠 미리보기 카드 구현

- Horizontal Card UI 레이아웃 완성
- 썸네일 이미지/폴백 로직 추가
- 제목/출처 표시 기능

Refs: #12
```

```
[Context2] feat: A1-01 홈 대시보드 기본 레이아웃

- 최근 저장 항목 섹션 구현
- 컬렉션 미리보기 섹션 추가
- 탭바 네비게이션 컴포넌트

Refs: #25
```

```
[Common] refactor: ContentCard 컴포넌트 공통화

- 맥락 1, 2에서 재사용 가능하도록 props 추상화
- 앨범형/리스트형 variant 추가

Refs: #18
```

## 5. GitHub 푸시 전략

### 5.1 초기 설정

```bash
# 1. 로컬 프로젝트 초기화
cd savebox
git init

# 2. .gitignore 생성
cat > .gitignore << EOF
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# 3. 원격 저장소 연결
git remote add origin https://github.com/kimjuheyeon/Savebox.git

# 4. 초기 커밋
git add .
git commit -m "chore: 프로젝트 초기 설정

- Next.js 14.2.5 프로젝트 생성
- 디렉토리 구조 설정
- Tailwind CSS 설정
"

# 5. main 브랜치로 푸시
git branch -M main
git push -u origin main

# 6. develop 브랜치 생성
git checkout -b develop
git push -u origin develop
```

### 5.2 일반 개발 워크플로우

**맥락 1 기능 개발 예시:**

```bash
# 1. develop 브랜치에서 최신 코드 가져오기
git checkout develop
git pull origin develop

# 2. 기능 브랜치 생성
git checkout -b feature/context1-s1-02-content-preview

# 3. 개발 작업 수행
# ... 코드 작성 ...

# 4. 변경사항 스테이징
git add src/app/(share-extension)/components/ShareContentPreview.tsx

# 5. 커밋
git commit -m "[Context1] feat: S1-02 콘텐츠 미리보기 카드 구현

- Horizontal Card UI 레이아웃
- 썸네일 이미지 로딩 로직
- 이미지 없을 경우 이니셜 폴백

Refs: #12
"

# 6. 원격 브랜치로 푸시
git push -u origin feature/context1-s1-02-content-preview

# 7. GitHub에서 Pull Request 생성
# - Base: develop
# - Compare: feature/context1-s1-02-content-preview
# - 리뷰 요청 및 머지
```

**맥락 2 기능 개발 예시:**

```bash
# 1. develop에서 새 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/context2-a1-01-home

# 2. 개발 및 커밋
git add src/app/(main-app)/page.tsx
git commit -m "[Context2] feat: A1-01 홈 대시보드 구현

- 최근 저장 항목 섹션
- 컬렉션 미리보기 섹션
- 탭바 네비게이션 통합

Refs: #25
"

# 3. 푸시 및 PR
git push -u origin feature/context2-a1-01-home
```

### 5.3 공통 컴포넌트 개발

```bash
# 공통 컴포넌트는 별도 브랜치
git checkout -b feature/common-content-card

# 개발 후 커밋
git commit -m "[Common] feat: ContentCard 공통 컴포넌트 추가

- 앨범형/리스트형 variant 지원
- 맥락 1, 2 모두 사용 가능
- Thumbnail 폴백 로직 포함

Refs: #18
"

git push -u origin feature/common-content-card
```

### 5.4 머지 전략

**Pull Request 머지 순서:**

1. **공통 기능** → `develop`
   - 데이터 모델, 공통 컴포넌트 우선 머지

2. **맥락 1 기능** → `develop`
   - S1-01 → S1-02 → S1-03 → ... 순차 머지

3. **맥락 2 기능** → `develop`
   - A1-01 → A1-02 → A1-03 → ... 순차 머지

4. **develop** → `main` (프로덕션 배포)
   - Sprint 단위로 배포
   - Release 태그 생성

## 6. 개발 단계별 우선순위

### Phase 1: 맥락 1 완성 (우선)

```bash
# 브랜치 생성 순서
1. feature/common-db-schema          # 데이터 모델
2. feature/common-content-card       # 공통 컴포넌트
3. feature/context1-s1-01-entry      # 진입 화면
4. feature/context1-s1-02-preview    # 콘텐츠 미리보기
5. feature/context1-s1-03-list       # 컬렉션 리스트
6. feature/context1-s1-04-create     # 새 컬렉션 생성
7. feature/context1-s1-05-snackbar   # 저장 완료
8. feature/context1-s1-06-auto-return # 자동 복귀
```

### Phase 2: 맥락 2 개발

```bash
# 맥락 1 완료 후 시작
1. feature/context2-a1-01-home          # 홈 대시보드
2. feature/context2-a1-02-collection    # 컬렉션 관리
3. feature/context2-a1-03-library       # 콘텐츠 목록
4. feature/context2-a1-04-detail        # 콘텐츠 상세
5. feature/context2-a1-05-search        # 검색
6. feature/context2-a1-06-settings      # 설정
```

## 7. PR 템플릿

`.github/PULL_REQUEST_TEMPLATE.md` 생성:

```markdown
## 변경 사항

### 맥락
- [ ] Context 1: Share Extension
- [ ] Context 2: Main App
- [ ] Common: 공통 기능

### 화면 ID
<!-- 예: S1-02, A1-01 -->

### 구현 내용
<!-- 구현한 기능을 간략히 설명 -->

## 체크리스트
- [ ] PRD 요구사항 충족
- [ ] TypeScript 타입 정의 완료
- [ ] 반응형 디자인 확인
- [ ] 접근성 검토 (a11y)
- [ ] 에러 처리 구현
- [ ] 성능 최적화 확인

## 스크린샷
<!-- UI 변경 시 스크린샷 첨부 -->

## 관련 이슈
Closes #이슈번호
```

## 8. 협업 가이드라인

### 8.1 코드 리뷰 규칙

1. **모든 PR은 최소 1명 이상 리뷰 필수**
2. **맥락별 담당자 지정 권장:**
   - Context 1 담당: Share Extension 전문
   - Context 2 담당: Main App 전문
   - Common 담당: 공통 인프라
3. **리뷰 체크포인트:**
   - PRD 요구사항 일치 여부
   - 타입 안정성
   - 성능 영향도
   - 재사용성

### 8.2 이슈 관리

GitHub Issues 라벨 시스템:

```
맥락:
- context1:share-extension
- context2:main-app
- common

타입:
- type:feature
- type:bug
- type:refactor
- type:docs

우선순위:
- priority:critical
- priority:high
- priority:medium
- priority:low

상태:
- status:todo
- status:in-progress
- status:review
- status:done
```

## 9. 자동화 설정

### 9.1 GitHub Actions CI

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

### 9.2 배포 자동화

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 10. 트러블슈팅

### Q1. 맥락 1과 2의 공통 컴포넌트를 수정했는데 충돌이 발생해요.

**A:** 공통 컴포넌트는 별도 브랜치에서 개발 후 먼저 develop에 머지하고, 이후 맥락별 브랜치를 rebase하세요.

```bash
# Common 브랜치 머지
git checkout develop
git merge feature/common-content-card

# 맥락 1 브랜치 업데이트
git checkout feature/context1-s1-02-preview
git rebase develop
```

### Q2. 맥락 1 완료 전에 맥락 2를 먼저 개발해도 될까요?

**A:** 권장하지 않습니다. 맥락 1이 데이터 구조의 기반이 되므로, 맥락 1 완성 후 맥락 2 착수가 효율적입니다.

### Q3. 프로덕션 배포는 언제 하나요?

**A:** Sprint 단위로 develop → main 머지를 통해 배포합니다.
- Sprint 1: 맥락 1 완성
- Sprint 2: 맥락 2 기본 기능
- Sprint 3: 맥락 2 고도화

---

## 11. 요약 체크리스트

- [x] Next.js 프로젝트 생성
- [ ] 디렉토리 구조 설정 (Route Groups 활용)
- [ ] Git 초기화 및 원격 저장소 연결
- [ ] develop 브랜치 생성
- [ ] .gitignore 설정
- [ ] PR 템플릿 작성
- [ ] GitHub Actions CI/CD 설정
- [ ] 맥락 1 기능 브랜치 생성 시작
- [ ] 공통 컴포넌트 개발 시작
- [ ] 코드 리뷰 프로세스 확립

**다음 단계:**
1. `feature/common-db-schema` 브랜치 생성
2. IndexedDB 스키마 정의
3. Content, Collection 타입 정의
4. PR 생성 및 리뷰

이 구조를 따라 개발하면 맥락 1, 2를 효율적으로 관리하면서도 코드 재사용성과 유지보수성을 극대화할 수 있습니다.
