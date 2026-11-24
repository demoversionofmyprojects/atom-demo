import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getProduct } from '../data/products';
import { transitionScreen } from '../lib/motion';
import { haptic } from '../lib/telegram';
import { load, save } from '../lib/storage';
import { DEFAULT_FILTERS, type Filters } from './filters';

export type Tab = 'home' | 'catalog' | 'favorites' | 'cart';

/** Порядок вкладок у нижній навігації — задає напрямок переходів між екранами. */
export const TAB_ORDER: Tab[] = ['home', 'catalog', 'favorites', 'cart'];

export interface CartItem {
  productId: string;
  ml: number;
  qty: number;
}

interface Toast {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
}

interface AppState {
  tab: Tab;
  setTab: (tab: Tab) => void;

  openedProductId: string | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;

  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, ml: number) => void;
  setQty: (productId: string, ml: number, qty: number) => void;
  removeFromCart: (productId: string, ml: number) => void;
  clearCart: () => void;

  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;

  toast: Toast | null;
  showToast: (text: string, action?: Toast['action']) => void;
}

const AppContext = createContext<AppState | null>(null);

const sameLine = (a: CartItem, productId: string, ml: number) => a.productId === productId && a.ml === ml;

export function AppProvider({ children }: { children: ReactNode }) {
  // ?tab=catalog відкриває застосунок одразу на потрібній вкладці (посилання для клієнта, знімки)
  const initialTab = TAB_ORDER.find((t) => t === new URLSearchParams(location.search).get('tab')) ?? 'home';
  const [tab, setTabState] = useState<Tab>(initialTab);
  const [openedProductId, setOpenedProductId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() =>
    load<string[]>('favorites', []).filter((id) => getProduct(id)),
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    load<CartItem[]>('cart', []).filter((i) => getProduct(i.productId)),
  );
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number>();

  useEffect(() => save('favorites', favorites), [favorites]);
  useEffect(() => save('cart', cart), [cart]);

  const tabRef = useRef<Tab>(initialTab);
  const setTab = useCallback((next: Tab) => {
    const current = tabRef.current;
    haptic.select();
    if (next === current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    tabRef.current = next;
    const direction = TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(current) ? 1 : -1;
    transitionScreen(() => {
      setTabState(next);
      window.scrollTo({ top: 0 });
    }, direction);
  }, []);

  const showToast = useCallback((text: string, action?: Toast['action']) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, action });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const openProduct = useCallback((id: string) => {
    haptic.tap();
    setOpenedProductId(id);
  }, []);
  const closeProduct = useCallback(() => setOpenedProductId(null), []);

  const toggleFavorite = useCallback(
    (id: string) => {
      haptic.tap();
      const has = favorites.includes(id);
      showToast(has ? 'Видалено з обраного' : 'Додано до обраного');
      setFavorites((prev) => (has ? prev.filter((x) => x !== id) : [id, ...prev]));
    },
    [favorites, showToast],
  );

  const addToCart = useCallback(
    (productId: string, ml: number) => {
      haptic.success();
      setCart((prev) =>
        prev.some((i) => sameLine(i, productId, ml))
          ? prev.map((i) => (sameLine(i, productId, ml) ? { ...i, qty: Math.min(i.qty + 1, 10) } : i))
          : [...prev, { productId, ml, qty: 1 }],
      );
      showToast('Додано до кошика', {
        label: 'Перейти',
        onClick: () => {
          setOpenedProductId(null);
          setTab('cart');
        },
      });
    },
    [setTab, showToast],
  );

  const setQty = useCallback((productId: string, ml: number, qty: number) => {
    haptic.select();
    setCart((prev) =>
      prev.map((i) => (sameLine(i, productId, ml) ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, ml: number) => {
    haptic.tap();
    setCart((prev) => prev.filter((i) => !sameLine(i, productId, ml)));
  }, []);

  const value = useMemo<AppState>(() => {
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const cartTotal = cart.reduce((sum, i) => {
      const price = getProduct(i.productId)?.volumes.find((v) => v.ml === i.ml)?.price ?? 0;
      return sum + price * i.qty;
    }, 0);
    return {
      tab,
      setTab,
      openedProductId,
      openProduct,
      closeProduct,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      cart,
      cartCount,
      cartTotal,
      addToCart,
      setQty,
      removeFromCart,
      clearCart: () => setCart([]),
      filters,
      setFilters,
      toast,
      showToast,
    };
  }, [tab, setTab, openedProductId, openProduct, closeProduct, favorites, toggleFavorite, cart, addToCart, setQty, removeFromCart, filters, toast, showToast]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
