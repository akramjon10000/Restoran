// Telegram WebApp Helper Utility

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: TelegramUser;
          query_id?: string;
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}

export const getTelegramWebApp = () => {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
};

export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  if (['success', 'warning', 'error'].includes(style)) {
    tg.HapticFeedback.notificationOccurred(style as 'success' | 'warning' | 'error');
  } else {
    tg.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy');
  }
};

export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.headerColor = '#ffffff';
      tg.backgroundColor = '#ffffff';
    } catch (e) {}
  }
};
