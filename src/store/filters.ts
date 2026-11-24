import { priceBounds, volumeFor, type DecantMl } from '../data/products';
import type { Family, Gender, Product } from '../data/types';

export type SortKey = 'popular' | 'price-asc' | 'price-desc';

export const SORT_LABELS: Record<SortKey, string> = {
  popular: 'Популярні',
  'price-asc': 'Ціна: за зростанням',
  'price-desc': 'Ціна: за спаданням',
};

export interface Filters {
  query: string;
  brands: string[];
  families: Family[];
  genders: Gender[];
  price: [number, number];
  sort: SortKey;
  /** Об'єм розпиву, за яким показуються й фільтруються ціни всієї сітки. */
  ml: DecantMl;
}

/** Скинуті фільтри для обраного об'єму: об'єм лишається, ціна — на весь діапазон. */
export function freshFilters(ml: DecantMl = 5): Filters {
  const b = priceBounds(ml);
  return { query: '', brands: [], families: [], genders: [], price: [b.min, b.max], sort: 'popular', ml };
}

export const DEFAULT_FILTERS = freshFilters();

/** Кількість активних фільтрів (без пошуку й сортування) — для бейджа на кнопці. */
export function activeFilterCount(f: Filters) {
  const b = priceBounds(f.ml);
  const priceActive = f.price[0] > b.min || f.price[1] < b.max;
  return f.brands.length + f.families.length + f.genders.length + (priceActive ? 1 : 0);
}

const normalize = (s: string) => s.toLocaleLowerCase('uk').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function applyFilters(products: Product[], f: Filters): Product[] {
  const q = normalize(f.query.trim());
  const result = products.filter((p) => {
    if (q) {
      const haystack = normalize(
        [p.brand, p.name, p.tagline, ...p.notes.top, ...p.notes.heart, ...p.notes.base].join(' '),
      );
      if (!haystack.includes(q)) return false;
    }
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.families.length && !f.families.includes(p.family)) return false;
    if (f.genders.length && !f.genders.includes(p.gender)) return false;
    const price = volumeFor(p, f.ml).price;
    return price >= f.price[0] && price <= f.price[1];
  });

  const byPrice = (a: Product, b: Product) => volumeFor(a, f.ml).price - volumeFor(b, f.ml).price;
  switch (f.sort) {
    case 'price-asc':
      return result.sort(byPrice);
    case 'price-desc':
      return result.sort((a, b) => byPrice(b, a));
    default:
      return result.sort((a, b) => b.popularity - a.popularity);
  }
}
