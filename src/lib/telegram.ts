export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

/**
 * Robust check if running inside Telegram Mini App
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return false;
  // If Telegram.WebApp exists and has platform or initData
  return Boolean(tg.initData || tg.initDataUnsafe?.user || (tg.platform && tg.platform !== 'unknown'));
}

/**
 * Extracts Telegram user from Telegram.WebApp, initData query string, or URL hash
 */
export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const tg = (window as any).Telegram?.WebApp;

    // 1. Direct initDataUnsafe.user
    if (tg?.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
      return tg.initDataUnsafe.user;
    }

    // 2. Parse from initData string if user object is serialized
    if (tg?.initData) {
      const params = new URLSearchParams(tg.initData);
      const userStr = params.get('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    }

    // 3. Fallback: Parse from window.location.hash or search (e.g. tgWebAppData=...)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const tgWebAppData = hashParams.get('tgWebAppData');
      if (tgWebAppData) {
        const innerParams = new URLSearchParams(tgWebAppData);
        const userStr = innerParams.get('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
    }
  } catch (e) {
    console.error('Error parsing Telegram user:', e);
  }

  return null;
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  if (typeof window === 'undefined') return;

  // 1. Official Telegram Mini App Haptic API
  const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
  if (haptic) {
    try {
      if (type === 'success' || type === 'warning' || type === 'error') {
        haptic.notificationOccurred(type);
      } else {
        haptic.impactOccurred(type);
      }
    } catch {
      // ignore
    }
  }

  // 2. Standard Mobile Browser Vibration Fallback
  if ('vibrate' in navigator) {
    try {
      if (type === 'heavy' || type === 'error') {
        navigator.vibrate([40, 30, 60]);
      } else if (type === 'success') {
        navigator.vibrate([25, 25, 45]);
      } else {
        navigator.vibrate(20);
      }
    } catch {
      // ignore
    }
  }
}

export function initTelegramMiniApp(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp) {
    try {
      webApp.ready();
      webApp.expand();
      if (webApp.enableClosingConfirmation) {
        webApp.enableClosingConfirmation();
      }
    } catch {
      // ignore
    }
  }
  return getTelegramUser();
}

/**
 * Modern Telegram Stars (XTR) payment trigger
 */
export async function openStarsPayment(
  itemId: string,
  onSuccess: () => void,
  onError: (msg: string) => void
) {
  const user = getTelegramUser();
  try {
    const res = await fetch('/api/telegram/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, userId: user?.id }),
    });
    const data = await res.json();
    if (!data.success) {
      onError(data.error || 'Ошибка формирования счёта в Stars');
      return;
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openInvoice && !data.isMock) {
      tg.openInvoice(data.invoiceLink, (status: string) => {
        if (status === 'paid') {
          triggerHaptic('success');
          onSuccess();
        } else if (status === 'cancelled') {
          onError('Оплата звёздами отменена');
        } else {
          onError(`Статус оплаты: ${status}`);
        }
      });
    } else {
      // Fallback: in browser or mock environment, simulate Stars payment
      triggerHaptic('success');
      onSuccess();
    }
  } catch {
    onError('Сетевая ошибка при запросе к Telegram Stars');
  }
}
