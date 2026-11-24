import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { AnimatePresence, motion } from 'motion/react';
import { CloseIcon, FilterIcon, GridIcon, ListIcon, SearchIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { RollingNumber } from '../components/RollingNumber';
import { Sheet } from '../components/Sheet';
import { SpectrumFilter } from '../components/SpectrumFilter';
import { VolumeSwitch } from '../components/VolumeSwitch';
import { PRODUCTS } from '../data/products';
import { plural } from '../lib/format';
import { useScrollFrame } from '../lib/motion';
import { useApp } from '../store/AppContext';
import { activeFilterCount, applyFilters, freshFilters } from '../store/filters';

const AROMAS: [string, string, string] = ['аромат', 'аромати', 'ароматів'];

// Підказки, що по черзі «прокручуються» в порожньому полі пошуку
const SEARCH_HINTS = ['Бренд, назва або нота', 'Наприклад, «Tom Ford»', 'Або нота: «ваніль»', 'Або «сандал»', 'Або «Baccarat»'];

function useRotatingHint(active: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % SEARCH_HINTS.length), 2800);
    return () => window.clearInterval(t);
  }, [active]);
  return index;
}

export function CatalogScreen() {
  const { filters, setFilters } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const results = useMemo(() => applyFilters(PRODUCTS, filters), [filters]);
  const [dense, setDense] = useState(false);
  const activeCount = activeFilterCount(filters);
  const resetAll = () => setFilters((f) => freshFilters(f.ml));

  // Панель пошуку отримує «скляний» фон і тінь, коли прилипає до верху екрана
  const toolbarRef = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const bar = toolbarRef.current;
    if (bar) bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= 1 && window.scrollY > 40);
  });

  const [searchFocused, setSearchFocused] = useState(false);
  const showHints = !filters.query && !searchFocused;
  const hint = useRotatingHint(showHints);

  return (
    <div className="screen catalog">
      <PageHeader
        title="Каталог"
        subtitle={`${PRODUCTS.length} ${plural(PRODUCTS.length, AROMAS)}`}
        aside={<VolumeSwitch />}
      />

      <div className="toolbar" ref={toolbarRef}>
        <label className="search">
          <SearchIcon size={18} />
          <span className="search__field">
            <input
              type="search"
              inputMode="search"
              placeholder={showHints ? '' : SEARCH_HINTS[0]}
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Пошук ароматів"
            />
            {showHints && (
              <span className="search__hint" key={hint} aria-hidden>
                {SEARCH_HINTS[hint]}
              </span>
            )}
          </span>
          {filters.query && (
            <button
              className="search__clear"
              onClick={() => setFilters((f) => ({ ...f, query: '' }))}
              aria-label="Очистити пошук"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </label>
        <button className="filter-btn" onClick={() => setFiltersOpen(true)} aria-label="Фільтри">
          <FilterIcon size={20} />
          {activeCount > 0 && (
            <span className="filter-btn__count" key={activeCount}>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <SpectrumFilter />

      <div className="catalog__layout">
        <aside className="catalog__aside">
          <div className="catalog__aside-head">
            <h2 className="section__title">Фільтри</h2>
            {activeCount > 0 && (
              <button className="link-btn" onClick={resetAll}>
                Скинути
              </button>
            )}
          </div>
          <FilterPanel />
        </aside>

        <div className="catalog__main">
          <div className="results-bar">
            <span>
              Знайдено <RollingNumber value={String(results.length)} /> {plural(results.length, AROMAS)}
            </span>
            {(activeCount > 0 || filters.query) && (
              <button className="link-btn" onClick={resetAll}>
                Скинути все
              </button>
            )}
            <span className="view-switch" role="radiogroup" aria-label="Вигляд каталогу">
              <button role="radio" aria-checked={!dense} aria-label="Сітка" className={dense ? '' : 'is-active'} onClick={() => setDense(false)}>
                <GridIcon size={18} />
              </button>
              <button role="radio" aria-checked={dense} aria-label="Щільний список" className={dense ? 'is-active' : ''} onClick={() => setDense(true)}>
                <ListIcon size={18} />
              </button>
            </span>
          </div>

          {results.length ? (
            // Motion перестроює сітку при фільтрації: картки, що лишились, з'їжджаються, решта тане
            <div className={dense ? 'rows' : 'grid'} key={dense ? 'rows' : 'grid'}>
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    className="grid__cell"
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                    transition={{ layout: { type: 'spring', stiffness: 380, damping: 38 } }}
                  >
                    <ProductCard product={p} dense={dense} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              icon={<SearchIcon size={28} />}
              title="Нічого не знайдено"
              text={
                filters.query
                  ? `За запитом «${filters.query}» немає ароматів. Спробуйте іншу назву, бренд чи ноту — наприклад, «ваніль» або «сандал».`
                  : 'Жоден аромат не відповідає обраним фільтрам. Спробуйте розширити діапазон ціни або прибрати частину умов.'
              }
              action={{ label: 'Скинути фільтри', onClick: resetAll }}
            />
          )}
        </div>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={closeFilters}
        title="Фільтри"
        className="sheet--filters"
        footer={
          <div className="sheet-actions">
            <button className="btn btn--ghost" onClick={resetAll} disabled={activeCount === 0}>
              Скинути
            </button>
            <button className="btn btn--primary" onClick={closeFilters}>
              Показати {results.length} {plural(results.length, AROMAS)}
            </button>
          </div>
        }
      >
        <FilterPanel />
      </Sheet>
    </div>
  );
}
