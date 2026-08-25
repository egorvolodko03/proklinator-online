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
  const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
  if (haptic) {
    if (type === 'success' || type === 'warning' || type === 'error') {
      haptic.notificationOccurred(type);
    } else {
      haptic.impactOccurred(type);
    }
  }
}

export function initTelegramWebApp() {
  if (typeof window === 'undefined') return;
  const webApp = (window as any).Telegram?.WebApp;
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
}
