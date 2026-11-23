import { useEffect, useRef } from 'react';
import { EASE, prefersReducedMotion } from '../lib/motion';
import { TAB_ORDER, useApp, type Tab } from '../store/AppContext';
import { BagIcon, GridIcon, HeartIcon, HomeIcon } from './Icons';

const ITEMS: { tab: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { tab: 'home', label: 'Головна', Icon: HomeIcon },
  { tab: 'catalog', label: 'Каталог', Icon: GridIcon },
  { tab: 'favorites', label: 'Обране', Icon: HeartIcon },
  { tab: 'cart', label: 'Кошик', Icon: BagIcon },
];

export function BottomNav() {
  const { tab, setTab, cartCount, favorites } = useApp();
  const counters: Partial<Record<Tab, number>> = { cart: cartCount, favorites: favorites.length };
  const index = TAB_ORDER.indexOf(tab);
  const pillRef = useRef<HTMLSpanElement>(null);
  const prevIndex = useRef(index);

  // Капсула переїжджає до активної вкладки й на ходу трохи розтягується, як крапля
  useEffect(() => {
    const distance = Math.abs(index - prevIndex.current);
    prevIndex.current = index;
    if (!distance || !pillRef.current || prefersReducedMotion()) return;
    pillRef.current.animate(
      [{ transform: 'scaleX(1)' }, { transform: `scaleX(${1 + 0.22 * Math.min(distance, 3)}) scaleY(0.9)` }, { transform: 'scaleX(1)' }],
      { duration: 560, easing: EASE.std },
    );
  }, [index]);

  return (
    <nav className="bottom-nav" aria-label="Головна навігація">
      <span className="bottom-nav__indicator" style={{ '--i': index } as React.CSSProperties} aria-hidden>
        <span className="bottom-nav__pill" ref={pillRef} />
      </span>
      {ITEMS.map(({ tab: id, label, Icon }) => {
        const count = counters[id];
        return (
          <button
            key={id}
            data-tab={id}
            className={`bottom-nav__item${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <span className="bottom-nav__icon">
              {id === 'favorites' ? <HeartIcon size={22} filled={tab === id} /> : <Icon size={22} />}
              {!!count && (
                <span className="bottom-nav__count" key={count}>
                  {count}
                </span>
              )}
            </span>
            <span className="bottom-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
