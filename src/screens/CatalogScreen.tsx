import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { FilterPanel } from '../components/FilterPanel';
import { CloseIcon, FilterIcon, SearchIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { RollingNumber } from '../components/RollingNumber';
import { Sheet } from '../components/Sheet';
import { FAMILY_LABELS } from '../data/dictionaries';
import { PRODUCTS } from '../data/products';
import type { Family } from '../data/types';
import { plural } from '../lib/format';
import { useFlip, useScrollFrame } from '../lib/motion';
import { useApp } from '../store/AppContext';
import { DEFAULT_FILTERS, activeFilterCount, applyFilters } from '../store/filters';

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
  const gridRef = useRef<HTMLDivElement>(null);
  useFlip(gridRef, results.map((p) => p.id).join());
  const activeCount = activeFilterCount(filters);
  const resetAll = () => setFilters(DEFAULT_FILTERS);

  // Панель пошуку отримує «скляний» фон і тінь, коли прилипає до верху екрана
  const toolbarRef = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const bar = toolbarRef.current;
    if (bar) bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= 1 && window.scrollY > 40);
  });

  const [searchFocused, setSearchFocused] = useState(false);
  const showHints = !filters.query && !searchFocused;
  const hint = useRotatingHint(showHints);

  const toggleFamily = (fam: Family) =>
    setFilters((f) => ({
      ...f,
      families: f.families.includes(fam) ? f.families.filter((x) => x !== fam) : [...f.families, fam],
    }));

  return (
    <div className="screen catalog">
      <PageHeader title="Каталог" subtitle={`${PRODUCTS.length} ${plural(PRODUCTS.length, AROMAS)} у демо-колекції`} />

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

      <div className="chips chips--scroll" aria-label="Швидкий вибір родини">
        {(Object.keys(FAMILY_LABELS) as Family[]).map((fam) => (
          <button
            key={fam}
            className={`chip${filters.families.includes(fam) ? ' is-active' : ''}`}
            onClick={() => toggleFamily(fam)}
            aria-pressed={filters.families.includes(fam)}
          >
            {FAMILY_LABELS[fam]}
          </button>
        ))}
      </div>

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
          </div>

          {results.length ? (
            <div className="grid" ref={gridRef}>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
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
