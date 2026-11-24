import type { Family, Product } from './types';

/** Родина окремої ноти. Фруктові ноти — окремий відтінок хроматограми, але не фільтр каталогу. */
export type NoteKind = Family | 'fruity';

/** Колір кожної родини: ним фарбуються шари хроматограми й смуга спектра у фільтрі. */
export const KIND_COLORS: Record<NoteKind, string> = {
  woody: '#8A6A4A',
  floral: '#D9A3A0',
  amber: '#B8862E',
  citrus: '#E3C65C',
  chypre: '#7F8A5C',
  gourmand: '#9C5F2E',
  spicy: '#B5593A',
  green: '#93AA78',
  musk: '#E2D7C4',
  fruity: '#C96B7A',
};

const NOTE_KIND: Record<string, NoteKind> = {
  Інжир: 'green', Ірис: 'floral', 'Австралійський сандал': 'woody', 'Акорд каштана': 'gourmand',
  Амбра: 'amber', Амбретта: 'musk', 'Амброве дерево': 'amber', Амброксан: 'musk', Ананас: 'fruity',
  Бензоїн: 'amber', Бергамот: 'citrus', Береза: 'woody', 'Боби тонка': 'gourmand', 'Білий мускус': 'musk',
  Ваніль: 'gourmand', Ветивер: 'woody', 'Вишневий лікер': 'fruity', 'Гваякове дерево': 'woody',
  Гвоздика: 'spicy', 'Гіркий мигдаль': 'gourmand', 'Деревина інжиру': 'woody', 'Деревні ноти': 'woody',
  'Дубовий мох': 'chypre', Дягель: 'green', Жасмин: 'floral', 'Жасмин самбак': 'floral', 'Зелені ноти': 'green',
  Какао: 'gourmand', Кардамон: 'spicy', Кашмеран: 'musk', 'Квіти тютюну': 'floral', Кедр: 'woody',
  Кокос: 'gourmand', Кориця: 'spicy', Коріандр: 'spicy', Лабданум: 'amber', Лаванда: 'green', Ладан: 'amber',
  Ладанник: 'amber', Лимон: 'citrus', 'Листя інжиру': 'green', Лічі: 'fruity', 'Мадагаскарська ваніль': 'gourmand',
  Малина: 'fruity', Мандарин: 'citrus', Маршмелоу: 'gourmand', 'Мускатний горіх': 'spicy', Мускус: 'musk',
  Неролі: 'citrus', Опопонакс: 'amber', Орегано: 'green', Папірус: 'woody', Пачулі: 'chypre', Перець: 'spicy',
  'Перець пімент': 'spicy', 'Перуанський бальзам': 'amber', Прянощі: 'spicy', Півонія: 'floral', Ревінь: 'green',
  'Рожевий перець': 'spicy', Сандал: 'woody', 'Сицилійський апельсин': 'citrus', 'Смажена тонка': 'gourmand',
  'Смола ялиці': 'amber', 'Соснова хвоя': 'green', Сухофрукти: 'fruity', Троянда: 'floral',
  'Турецька троянда': 'floral', 'Тютюновий лист': 'amber', Уд: 'woody', 'Фруктовий акорд': 'fruity',
  Фіалка: 'floral', 'Цвіт апельсина': 'floral', 'Чорна вишня': 'fruity', 'Чорна смородина': 'fruity',
  Шафран: 'spicy', Шкіра: 'woody', Яблуко: 'fruity', Ялівець: 'green',
};

/** Колір ноти; невідома нота фарбується родиною самого аромату. */
export const noteColor = (note: string, product: Product) => KIND_COLORS[NOTE_KIND[note] ?? product.family];

export const unmappedNotes = (products: Product[]) =>
  products.flatMap((p) => [...p.notes.top, ...p.notes.heart, ...p.notes.base]).filter((n) => !NOTE_KIND[n]);
