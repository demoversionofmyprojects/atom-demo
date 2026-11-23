import { useEffect, useRef } from 'react';
import { BottomNav } from './components/BottomNav';
import { ProductSheet } from './components/ProductSheet';
import { Toast } from './components/Toast';
import { revealWithin } from './lib/motion';
import { CartScreen } from './screens/CartScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TAB_ORDER, useApp, type Tab } from './store/AppContext';

const SCREENS: Record<Tab, () => JSX.Element> = {
  home: HomeScreen,
  catalog: CatalogScreen,
  favorites: FavoritesScreen,
  cart: CartScreen,
};

export default function App() {
  const { tab } = useApp();
  const Screen = SCREENS[tab];
  const mainRef = useRef<HTMLElement>(null);

  const prevTab = useRef(tab);
  const direction = TAB_ORDER.indexOf(tab) >= TAB_ORDER.indexOf(prevTab.current) ? 1 : -1;
  useEffect(() => {
    prevTab.current = tab;
  }, [tab]);

  // Після кожного оновлення підхоплюємо нові елементи для анімації появи
  useEffect(() => {
    revealWithin(mainRef.current);
  });

  return (
    <div className="app">
      <main
        ref={mainRef}
        // Де є View Transitions, екрани змінює браузер (transitionScreen), і CSS-вхід вимикається
        className="app__main screen-enter"
        key={tab}
        style={{ '--dir': direction } as React.CSSProperties}
      >
        <Screen />
      </main>
      <BottomNav />
      <ProductSheet />
      <Toast />
    </div>
  );
}
