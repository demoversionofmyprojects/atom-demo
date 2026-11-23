/**
 * Тонкий шар адаптації до Telegram Web App.
 * Поза Telegram усі функції безпечно нічого не роблять — застосунок працює як звичайний сайт.
 * Дані користувача (initData) не читаються і не надсилаються: авторизації в демо немає.
 */

type Inset = { top: number; bottom: number; left: number; right: number };

interface TelegramWebApp {
  initData: string;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  viewportStableHeight: number;
  safeAreaInset?: Inset;
  contentSafeAreaInset?: Inset;
  ready(): void;
  expand(): void;
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  onEvent(event: string, cb: () => void): void;
  offEvent(event: string, cb: () => void): void;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const BRAND_BG = '#FDF9EF';

/** WebApp доступний лише коли сторінку справді відкрито в Telegram. */
function getWebApp(): TelegramWebApp | null {
  const wa = window.Telegram?.WebApp;
  return wa && wa.platform && wa.platform !== 'unknown' ? wa : null;
}

export const isTelegram = () => getWebApp() !== null;

const supports = (wa: TelegramWebApp, version: string) => {
  try {
    return wa.isVersionAtLeast(version);
  } catch {
    return false;
  }
};

function applyInsets(wa: TelegramWebApp) {
  const root = document.documentElement.style;
  const safe = wa.safeAreaInset;
  const content = wa.contentSafeAreaInset;
  // Системна safe area + зона, яку перекривають елементи Telegram (шапка у fullscreen)
  root.setProperty('--tg-inset-top', `${(safe?.top ?? 0) + (content?.top ?? 0)}px`);
  root.setProperty('--tg-inset-bottom', `${(safe?.bottom ?? 0) + (content?.bottom ?? 0)}px`);
  if (wa.viewportStableHeight) {
    root.setProperty('--app-height', `${wa.viewportStableHeight}px`);
  }
}

export function initTelegram() {
  const wa = getWebApp();
  if (!wa) return;
  document.documentElement.dataset.telegram = 'true';

  wa.ready();
  wa.expand();

  // Фірмова світла палітра лишається незмінною, а системні панелі Telegram
  // фарбуємо в її колір, щоб застосунок виглядав цілісно.
  if (supports(wa, '6.1')) {
    wa.setHeaderColor(BRAND_BG);
    wa.setBackgroundColor(BRAND_BG);
  }
  if (supports(wa, '7.10')) wa.setBottomBarColor?.(BRAND_BG);
  // Щоб прокручування каталогу не згортало застосунок випадковим свайпом
  if (supports(wa, '7.7')) wa.disableVerticalSwipes?.();

  const update = () => applyInsets(wa);
  update();
  ['viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged'].forEach((e) => wa.onEvent(e, update));
}

/** Показує системну кнопку «Назад» Telegram, поки активний обробник. Повертає функцію очищення. */
export function bindBackButton(handler: () => void) {
  const wa = getWebApp();
  if (!wa || !supports(wa, '6.1')) return () => {};
  wa.BackButton.onClick(handler);
  wa.BackButton.show();
  return () => {
    wa.BackButton.offClick(handler);
    wa.BackButton.hide();
  };
}

export const haptic = {
  tap: () => getWebApp()?.HapticFeedback?.impactOccurred('light'),
  select: () => getWebApp()?.HapticFeedback?.selectionChanged(),
  success: () => getWebApp()?.HapticFeedback?.notificationOccurred('success'),
};
