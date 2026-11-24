import { GENDER_LABELS } from '../data/dictionaries';
import { BRANDS, priceBounds } from '../data/products';
import type { Gender } from '../data/types';
import { formatPrice } from '../lib/format';
import { haptic } from '../lib/telegram';
import { useApp } from '../store/AppContext';
import { SORT_LABELS, type SortKey } from '../store/filters';

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

const PRICE_STEP = 10;
const PRICE_GAP = 50;


export function FilterPanel() {
  const { filters, setFilters } = useApp();
  const [lo, hi] = filters.price;
  const PRICE_BOUNDS = priceBounds(filters.ml);
  const span = PRICE_BOUNDS.max - PRICE_BOUNDS.min;
  // Пресети ділять діапазон обраного об'єму на третини, округлені до 50 ₴
  const cut = (k: number) => Math.round((PRICE_BOUNDS.min + (span * k) / 3) / 50) * 50;
  const PRICE_PRESETS: [string, [number, number]][] = [
    [`До ${formatPrice(cut(1))}`, [PRICE_BOUNDS.min, cut(1)]],
    [`${formatPrice(cut(1))} — ${formatPrice(cut(2))}`, [cut(1), cut(2)]],
    [`Від ${formatPrice(cut(2))}`, [cut(2), PRICE_BOUNDS.max]],
  ];

  const setPrice = (next: [number, number]) => setFilters((f) => ({ ...f, price: next }));
  const pick = <K extends 'brands' | 'families' | 'genders'>(key: K, value: (typeof filters)[K][number]) => {
    haptic.select();
    setFilters((f) => ({ ...f, [key]: toggle(f[key] as (typeof value)[], value) }));
  };

  return (
    <div className="filters">
      <section className="filters__group">
        <h3 className="section-label">Сортування</h3>
        <div className="chips chips--wrap">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              className={`chip${filters.sort === key ? ' is-active' : ''}`}
              onClick={() => setFilters((f) => ({ ...f, sort: key }))}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      <section className="filters__group">
        <h3 className="section-label">Для кого</h3>
        <div className="chips chips--wrap">
          {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
            <button
              key={g}
              className={`chip${filters.genders.includes(g) ? ' is-active' : ''}`}
              onClick={() => pick('genders', g)}
              aria-pressed={filters.genders.includes(g)}
            >
              {GENDER_LABELS[g]}
            </button>
          ))}
        </div>
      </section>

      <section className="filters__group">
        <h3 className="section-label">Бренд</h3>
        <div className="chips chips--wrap">
          {BRANDS.map((b) => (
            <button
              key={b}
              className={`chip${filters.brands.includes(b) ? ' is-active' : ''}`}
              onClick={() => pick('brands', b)}
              aria-pressed={filters.brands.includes(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      <section className="filters__group">
        <div className="filters__price-head">
          <h3 className="section-label">Ціна за {filters.ml} мл</h3>
          <span className="filters__price-value">
            {formatPrice(lo)} — {formatPrice(hi)}
          </span>
        </div>
        <div
          className="range"
          style={
            {
              '--from': `${((lo - PRICE_BOUNDS.min) / span) * 100}%`,
              '--to': `${((hi - PRICE_BOUNDS.min) / span) * 100}%`,
            } as React.CSSProperties
          }
        >
          <div className="range__track" />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={PRICE_STEP}
            value={lo}
            aria-label="Мінімальна ціна"
            onChange={(e) => setPrice([Math.min(Number(e.target.value), hi - PRICE_GAP), hi])}
          />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={PRICE_STEP}
            value={hi}
            aria-label="Максимальна ціна"
            onChange={(e) => setPrice([lo, Math.max(Number(e.target.value), lo + PRICE_GAP)])}
          />
        </div>
        <div className="chips chips--wrap">
          {PRICE_PRESETS.map(([label, range]) => {
            const active = lo === range[0] && hi === range[1];
            return (
              <button
                key={label}
                className={`chip chip--small${active ? ' is-active' : ''}`}
                onClick={() => setPrice(active ? [PRICE_BOUNDS.min, PRICE_BOUNDS.max] : range)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
