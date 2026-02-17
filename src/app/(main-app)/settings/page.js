'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, Sparkles, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ActionSnackbar from '@/components/ActionSnackbar';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';
import { fetchContents, fetchCollections } from '@/lib/api';

const STORAGE_LIMIT = 20;
const SOCIAL_WARNING_THRESHOLD = 15;

const OAUTH_CONFLICT_MESSAGE_PATTERN = /(already.*exists|identity.*exists|provider.*already|already.*linked|email.*associated|different.*provider|이미.*다른|다른.*제공자)/i;
const OAUTH_PROVIDER_DISABLED_PATTERN = /(provider.*not.*enabled|unsupported.*provider|provider.*disabled|지원.*되지|미활성화|비활성화)/i;

const PROVIDER_LABEL = {
  google: 'Google',
};

const PROVIDER_BADGE = {
  google: 'Google 연동',
};

const AVAILABLE_PROVIDERS = {
  google: {
    label: 'Google',
    badge: 'G',
    chipClass: 'bg-[#ECF2FC] text-[#4A6FA5]',
  },
};

const ACTIVATED_SOCIAL_PROVIDERS = (() => {
  const raw = process.env.NEXT_PUBLIC_SOCIAL_PROVIDERS || 'google';
  const parsed = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const normalized = parsed.filter((provider) => AVAILABLE_PROVIDERS[provider]);
  return normalized.length > 0 ? normalized : ['google'];
})();

const getProviderConfig = (provider) => AVAILABLE_PROVIDERS[provider] || null;

const isProviderActive = (provider) => ACTIVATED_SOCIAL_PROVIDERS.includes(provider);

const buildAuthCallbackUrl = (mode, provider) => {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
  return `${base}/auth/callback?mode=${mode}&provider=${provider}`;
};

const buildSocialConflictMessage = (provider) =>
  `이미 ${PROVIDER_LABEL[provider] || 'Google'}로 가입된 이메일이에요. 로그인 화면에서 로그인해주세요.`;

const normalizeAuthState = (sessionUser) => {
  const connected = new Set();
  const providers = [
    sessionUser?.app_metadata?.provider,
    ...(Array.isArray(sessionUser?.app_metadata?.providers) ? sessionUser.app_metadata.providers : []),
    ...(Array.isArray(sessionUser?.identities) ? sessionUser.identities : []).map((identity) => identity?.provider),
  ];

  providers.forEach((provider) => {
    if (provider === 'google' || provider === 'email') {
      connected.add(provider);
    }
  });

  const primary = sessionUser?.app_metadata?.provider;
  if (primary === 'google') {
    return { type: 'social', provider: primary, email: sessionUser?.email || '이메일 없음' };
  }

  if (connected.has('email')) {
    return { type: 'member', email: sessionUser?.email || '이메일 없음' };
  }

  if (connected.has('google')) {
    return {
      type: 'social',
      provider: 'google',
      email: sessionUser?.email || '이메일 없음',
    };
  }

  return { type: 'guest', email: '게스트 모드' };
};

export default function SettingsPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState({ type: 'guest', email: '게스트 모드' });
  const [sessionUser, setSessionUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isBusy, setIsBusy] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [guestSavedCount, setGuestSavedCount] = useState(15);

  const connectedSocialProviders = useMemo(() => {
    const providers = new Set();

    const list = [
      ...(sessionUser?.app_metadata?.providers || []),
      ...(sessionUser?.identities || []).map((identity) => identity?.provider).filter(Boolean),
      sessionUser?.app_metadata?.provider,
    ];

    list.forEach((provider) => {
      if (provider === 'google') {
        providers.add(provider);
      }
    });

    return Array.from(providers);
  }, [sessionUser]);

  const [memberSavedCount, setMemberSavedCount] = useState(0);
  const [memberCollectionCount, setMemberCollectionCount] = useState(0);
  const [memberSavedThisMonth, setMemberSavedThisMonth] = useState(0);

  useEffect(() => {
    if (authState.type === 'guest') return;
    async function loadStats() {
      try {
        const [contentsResult, collections] = await Promise.all([
          fetchContents({ limit: 1 }),
          fetchCollections(),
        ]);
        setMemberSavedCount(contentsResult.total || 0);
        setMemberCollectionCount(collections.filter((c) => !c.is_system).length);
        // 이번 달 저장 수는 total로 대체 (서버 필터링 미구현 시)
        setMemberSavedThisMonth(contentsResult.total || 0);
      } catch {}
    }
    loadStats();
  }, [authState.type]);

  const guestUsageRatio = Math.min(1, Math.max(0, guestSavedCount / STORAGE_LIMIT));
  const guestRemaining = Math.max(0, STORAGE_LIMIT - guestSavedCount);
  const showGuestWarning = guestSavedCount >= SOCIAL_WARNING_THRESHOLD;

  const isProviderConnected = (provider) => connectedSocialProviders.includes(provider);

  const activeSocialProviders = ACTIVATED_SOCIAL_PROVIDERS;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedGuest = window.localStorage.getItem('savebox-guest-saved-count');
    if (storedGuest !== null) {
      const parsedGuestCount = Number.parseInt(storedGuest, 10);
      if (Number.isFinite(parsedGuestCount)) {
        setGuestSavedCount(Math.max(0, Math.min(STORAGE_LIMIT, parsedGuestCount)));
      }
    }

    const pendingToast = window.sessionStorage.getItem('settings-toast');
    if (pendingToast) {
      setToastMessage(pendingToast);
      window.sessionStorage.removeItem('settings-toast');
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClientSafe();

    if (!supabase) {
      setAuthState({ type: 'guest', email: '게스트 모드' });
      setSessionUser(null);
      setIsAuthLoading(false);
      return;
    }

    const hydrate = async () => {
      setIsAuthLoading(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session?.user) {
          setAuthState({ type: 'guest', email: '게스트 모드' });
          setSessionUser(null);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const resolvedUser = userData?.user || sessionData.session.user;
        setSessionUser(resolvedUser || null);
        setAuthState(normalizeAuthState(resolvedUser));
      } catch {
        setAuthState({ type: 'guest', email: '게스트 모드' });
        setSessionUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void hydrate();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void hydrate();
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (message) => {
    if (!message) return;
    setToastMessage(message);
  };

  const handleSocialSignIn = async (provider) => {
    if (!isProviderActive(provider)) {
      showToast('현재 지원되지 않는 소셜 로그인입니다.');
      return;
    }

    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      showToast('소셜 로그인을 시작할 수 없습니다.');
      return;
    }

    setIsBusy(`signin-${provider}`);
    try {
      const redirectTo = buildAuthCallbackUrl('signin', provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) {
        const conflict = OAUTH_CONFLICT_MESSAGE_PATTERN.test(error.message || '');
        const disabled = OAUTH_PROVIDER_DISABLED_PATTERN.test(error.message || '');
        if (conflict) {
          showToast(buildSocialConflictMessage(provider));
          router.push('/auth/login');
          return;
        }
        if (disabled) {
          showToast('해당 소셜 로그인이 현재 비활성화되어 있습니다.');
          return;
        }
        showToast('로그인에 실패했어요. 이메일로 가입해보세요.');
        router.push('/auth');
      }
    } catch {
      showToast('로그인에 실패했어요. 이메일로 가입해보세요.');
      router.push('/auth');
    } finally {
      setIsBusy('');
    }
  };

  const handleSocialLink = async (provider) => {
    if (isProviderConnected(provider)) return;

    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      showToast('소셜 연동을 시작할 수 없습니다.');
      return;
    }

    setIsBusy(`link-${provider}`);
    try {
      const redirectTo = buildAuthCallbackUrl('link', provider);
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo },
      });

      if (error || !data?.url) {
        showToast('연동에 실패했어요. 잠시 후 다시 시도해주세요.');
        return;
      }

      window.location.assign(data.url);
    } catch {
      showToast('연동에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsBusy('');
    }
  };

  const handleLogout = async () => {
    if (isBusy) return;

    if (!confirm('로그아웃 하시겠어요?')) return;
    setIsBusy('logout');

    try {
      const supabase = getSupabaseBrowserClientSafe();
      if (supabase) {
        await supabase.auth.signOut();
      }

      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionUser(null);
      setAuthState({ type: 'guest', email: '게스트 모드' });
      showToast('로그아웃되었습니다.');
      router.push('/auth/login');
    } catch {
      showToast('로그아웃에 실패했어요.');
    } finally {
      setIsBusy('');
    }
  };

  const handleDeleteAccount = async () => {
    if (isBusy) return;

    if (!confirm('계정을 삭제하면 저장한 데이터는 복구할 수 없어요. 삭제할까요?')) return;

    setIsBusy('delete');
    try {
      const response = await fetch('/api/auth/delete-account', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        showToast(payload?.error || '계정 삭제에 실패했어요.');
        return;
      }

      const supabase = getSupabaseBrowserClientSafe();
      if (supabase) {
        await supabase.auth.signOut();
      }

      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      setSessionUser(null);
      setAuthState({ type: 'guest', email: '게스트 모드' });
      showToast('계정이 삭제되었어요.');
      router.push('/auth');
    } catch {
      showToast('계정 삭제에 실패했어요.');
    } finally {
      setIsBusy('');
    }
  };

  const accountRowsByState = () => {
    if (authState.type === 'guest') {
      const socialSignupRows = activeSocialProviders.map((provider) => {
        const config = getProviderConfig(provider) || { label: provider, badge: provider[0]?.toUpperCase(), chipClass: 'bg-[#ECF2FC] text-[#4A6FA5]' };

        return (
          <button
            type="button"
            key={`signup-social-${provider}`}
            onClick={() => handleSocialSignIn(provider)}
            disabled={Boolean(isBusy)}
            className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2233]">
              <span className={`grid h-8 w-8 place-items-center rounded-[8px] ${config.chipClass}`}>{config.badge}</span>
              {config.label}로 시작하기
            </span>
            <ChevronRight size={16} className="text-[#8896A8]" />
          </button>
        );
      });

      return (
        <>
          <Link
            href="/auth/login"
            className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
          >
            <span className="text-sm font-semibold text-[#1A2233]">로그인</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8896A8]">
              기존 계정 진입
              <ChevronRight size={16} />
            </span>
          </Link>
          <Link
            href="/auth"
            className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
          >
            <span className="text-sm font-semibold text-[#1A2233]">회원가입</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8896A8]">
              AUTH-01 이동
              <ChevronRight size={16} />
            </span>
          </Link>
          {socialSignupRows}
        </>
      );
    }

    if (authState.type === 'social') {
      return (
        <>
          <div className="rounded-[8px] px-3 py-3">
            <p className="text-sm font-semibold text-[#1A2233]">계정 정보</p>
            <p className="mt-1 text-xs text-[#8896A8]">{authState.email}</p>
          </div>
          <Link
            href="/collections"
            className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
          >
            <span className="text-sm font-semibold text-[#1A2233]">저장 설정</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8896A8]">
              기본 컬렉션
              <ChevronRight size={16} />
            </span>
          </Link>
        </>
      );
    }

    return (
      <>
        <div className="rounded-[8px] px-3 py-3">
          <p className="text-sm font-semibold text-[#1A2233]">계정 정보</p>
          <p className="mt-1 text-xs text-[#8896A8]">{authState.email}</p>
        </div>
        <div className="rounded-[8px] px-3 py-3">
          <p className="text-sm font-semibold text-[#1A2233]">이메일 변경</p>
          <p className="mt-1 text-xs text-[#8896A8]">현재 화면은 데모 플로우입니다.</p>
        </div>
        <div className="rounded-[8px] px-3 py-3">
          <p className="text-sm font-semibold text-[#1A2233]">비밀번호 변경</p>
          <p className="mt-1 text-xs text-[#8896A8]">현재 화면은 데모 플로우입니다.</p>
        </div>
        <Link
          href="/collections"
          className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
        >
          <span className="text-sm font-semibold text-[#1A2233]">저장 설정</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8896A8]">
            기본 컬렉션
            <ChevronRight size={16} />
          </span>
        </Link>
      </>
    );
  };

  const socialRows = useMemo(
    () =>
      activeSocialProviders.map((provider) => {
        const label = PROVIDER_LABEL[provider] || provider;
        const connected = connectedSocialProviders.includes(provider);
        const isCurrent = authState.type === 'social' && authState.provider === provider;

        return (
          <div key={provider} className="flex items-center justify-between rounded-[8px] px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1A2233]">{label}</p>
              <p className="mt-1 text-xs text-[#8896A8]">
                {connected ? `${label} 연동됨${isCurrent ? ' (현재 계정)' : ''}` : '연동되지 않음'}
              </p>
            </div>
            {connected ? (
              <span className="rounded-[8px] bg-[#F0F2F7] px-2 py-1 text-xs font-semibold text-[#8896A8]">연결됨</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSocialLink(provider)}
                disabled={Boolean(isBusy)}
                className="rounded-[8px] border border-[#E4E9F0] px-2 py-1 text-xs font-semibold text-[#4A6FA5]"
              >
                연동하기
              </button>
            )}
          </div>
        );
      }),
    [authState, isBusy, connectedSocialProviders],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[440px] bg-[#F0F2F7] pb-10">
      <PageHeader title="설정" />

      {isAuthLoading ? (
        <section className="px-4 py-4 text-sm text-[#8896A8]">사용자 상태를 불러오는 중...</section>
      ) : (
        <>
          <section className="px-4 pt-4">
            <div className="rounded-[14px] border border-[#E4E9F0] bg-[#FFFFFF] p-4 shadow-sm">
              {authState.type === 'guest' ? (
                <>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-[8px] bg-[#ECF2FA] px-2 py-1 text-xs font-semibold text-[#4A6FA5]">
                    <Sparkles size={14} />
                    게스트
                  </div>
                  <p className="text-sm font-bold text-[#1A2233]">현재 {guestSavedCount} / {STORAGE_LIMIT}개 저장</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-[999px] bg-[#E4E9F0]">
                    <div
                      className="h-full rounded-[999px] bg-[#4A6FA5] transition-all duration-200"
                      style={{ width: `${Math.floor(guestUsageRatio * 100)}%` }}
                    />
                  </div>
                  {showGuestWarning ? (
                    <p className="mt-2 text-xs text-[#8896A8]">
                      한도까지 {guestRemaining}개 남았어요. 가입하면 무제한 저장!
                    </p>
                  ) : null}
                </>
              ) : authState.type === 'social' ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-[8px] bg-[#4A6FA5] px-2 py-1 text-[11px] font-semibold text-white">
                      {PROVIDER_BADGE[authState.provider]}
                    </span>
                    <span className="rounded-[8px] border border-[#4A6FA5]/30 px-2 py-1 text-[11px] font-semibold text-[#4A6FA5]">
                      정회원
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#1A2233]">{authState.email}</p>
                  <p className="mt-1 text-xs text-[#8896A8]">연동된 제공자로 로그인됨</p>
                </>
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#4A6FA5] text-sm font-bold text-white">
                      {authState.email?.trim()?.[0]?.toUpperCase() || 'M'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A2233]">{authState.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-[8px] border border-[#4A6FA5]/30 px-2 py-1 text-[11px] font-semibold text-[#4A6FA5]">
                          정회원
                        </span>
                        <span className="rounded-[8px] border border-[#4A6FA5]/30 px-2 py-1 text-[11px] font-semibold text-[#4A6FA5]">
                          오픈 베타
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="rounded-[8px] bg-[#F6F9FF] p-3 text-xs text-[#8896A8]">
                    저장됨 {memberSavedCount}개 / 컬렉션 {memberCollectionCount}개 / 이번 달 {memberSavedThisMonth}개
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="mb-4 px-4 pt-4">
            <h2 className="mb-2 px-2 text-xs font-semibold text-[#8896A8]">계정</h2>
            <div className="overflow-hidden rounded-[14px] border border-[#E4E9F0] bg-white">
              <div className="space-y-1 p-1">{accountRowsByState()}</div>
            </div>
          </section>

          {authState.type !== 'guest' ? (
            <section className="mb-4 px-4">
              <h2 className="mb-2 px-2 text-xs font-semibold text-[#8896A8]">소셜 연동 관리</h2>
              <div className="overflow-hidden rounded-[14px] border border-[#E4E9F0] bg-white">
                <div className="space-y-1 p-1">{socialRows}</div>
              </div>
            </section>
          ) : null}

          <section className="mb-4 px-4">
            <h2 className="mb-2 px-2 text-xs font-semibold text-[#8896A8]">앱 정보</h2>
            <div className="overflow-hidden rounded-[14px] border border-[#E4E9F7] bg-white">
              <div className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left">
                <span className="text-sm font-semibold text-[#1A2233]">버전</span>
                <span className="text-xs font-semibold text-[#8896A8]">SaveBox v1.0.3</span>
              </div>
              <div className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left">
                <span className="text-sm font-semibold text-[#1A2233]">이용약관</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8896A8]">
                  보기
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </section>

          {authState.type !== 'guest' ? (
            <section className="px-4">
              <h2 className="mb-2 px-2 text-xs font-semibold text-[#8896A8]">안전</h2>
              <div className="overflow-hidden rounded-[14px] border border-[#E4E9F0] bg-white">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={Boolean(isBusy)}
                  className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2233]">
                    <LogOut size={16} />
                    로그아웃
                  </span>
                  <ChevronRight size={16} className="text-[#8896A8]" />
                </button>

                {authState.type === 'member' ? (
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={Boolean(isBusy)}
                    className="flex w-full items-center justify-between rounded-[8px] px-3 py-3 text-left transition hover:bg-[#F0F2F7]"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#E05252' }}>
                      <Trash2 size={16} />
                      계정 삭제
                    </span>
                    <ChevronRight size={16} className="text-[#8896A8]" />
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
        </>
      )}

      <ActionSnackbar
        open={Boolean(toastMessage)}
        message={toastMessage}
      />
    </main>
  );
}
