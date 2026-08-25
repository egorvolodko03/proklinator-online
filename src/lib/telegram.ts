export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Telegram?.WebApp?.initData);
}

export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
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

export function initTelegramMiniApp() {
  if (typeof window === 'undefined') return;
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
}
