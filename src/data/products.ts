import type { Product, Volume } from './types';

/**
 * ДЕМОНСТРАЦІЙНІ ДАНІ.
 * Аромати реальні, піраміди нот — за відкритими описами виробників.
 * Ціни, наявність та ілюстрації — приклад для презентації, не прайс Atom Parfums.
 * Замініть на реальний каталог (наприклад, завантаження з API) — структура Product лишиться тією ж.
 */

/** Магазин продає аромати на розпив: атомайзери 2, 5 і 10 мл. */
export const DECANT_SIZES = [2, 5, 10] as const;

const decant = (p2: number, p5: number, p10: number): Volume[] =>
  [p2, p5, p10].map((price, i) => ({ ml: DECANT_SIZES[i], price }));

/** За замовчуванням у картці показуємо 5 мл. */
const DEFAULT_DECANT = 1;

export const PRODUCTS: Product[] = [
  {
    id: 'mfk-baccarat-rouge-540',
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    concentration: 'edp',
    gender: 'unisex',
    family: 'amber',
    volumes: decant(290, 650, 1200),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Сяйво шафрану та амбри',
    description:
      'Один із найвпізнаваніших ароматів останнього десятиліття: прозорий, повітряний і водночас насичений. Шафран і жасмин переходять у теплу мінеральну амбру та смолу ялиці — шлейф, який помічають.',
    notes: {
      top: ['Шафран', 'Жасмин'],
      heart: ['Амброве дерево', 'Амбра'],
      base: ['Смола ялиці', 'Кедр'],
    },
    art: { shape: 'faceted', cap: 'disc', liquid: '#D8A39A', capTone: 'gold', backdrop: '#F5E7E2' },
    bestseller: true,
    popularity: 100,
  },
  {
    id: 'le-labo-santal-33',
    brand: 'Le Labo',
    name: 'Santal 33',
    concentration: 'edp',
    gender: 'unisex',
    family: 'woody',
    volumes: decant(260, 590, 1100),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Сандал, шкіра й папірус',
    description:
      'Сухий кремовий сандал із димною шкірою та пряним кардамоном. Культовий унісекс, що звучить стримано, але дуже характерно — аромат для щоденного носіння.',
    notes: {
      top: ['Кардамон', 'Ірис', 'Фіалка'],
      heart: ['Амброксан', 'Папірус'],
      base: ['Австралійський сандал', 'Кедр', 'Шкіра'],
    },
    art: { shape: 'tall', cap: 'cylinder', liquid: '#E2CDAE', capTone: 'black', backdrop: '#F1ECE3' },
    bestseller: true,
    popularity: 96,
  },
  {
    id: 'tom-ford-tobacco-vanille',
    brand: 'Tom Ford',
    name: 'Tobacco Vanille',
    concentration: 'edp',
    gender: 'unisex',
    family: 'spicy',
    volumes: decant(270, 620, 1150),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Тютюновий лист і ваніль',
    description:
      'Густий, теплий аромат із тютюновим листям, ваніллю, какао та сухофруктами. Затишний і розкішний водночас — особливо гарно розкривається в холодну погоду.',
    notes: {
      top: ['Тютюновий лист', 'Прянощі'],
      heart: ['Ваніль', 'Какао', 'Боби тонка', 'Квіти тютюну'],
      base: ['Сухофрукти', 'Деревні ноти'],
    },
    art: { shape: 'square', cap: 'cube', liquid: '#9C5F2E', capTone: 'gold', backdrop: '#F0E5D8' },
    bestseller: true,
    popularity: 94,
  },
  {
    id: 'creed-aventus',
    brand: 'Creed',
    name: 'Aventus',
    concentration: 'edp',
    gender: 'men',
    family: 'chypre',
    volumes: decant(290, 650, 1200),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Ананас, береза і мох',
    description:
      'Соковитий ананас і чорна смородина на старті, димна береза в серці та дубовий мох у базі. Впевнений фруктово-шипровий аромат, який давно став класикою чоловічої парфумерії.',
    notes: {
      top: ['Ананас', 'Бергамот', 'Чорна смородина', 'Яблуко'],
      heart: ['Береза', 'Пачулі', 'Жасмин', 'Троянда'],
      base: ['Мускус', 'Дубовий мох', 'Амбра', 'Ваніль'],
    },
    art: { shape: 'tall', cap: 'tower', liquid: '#C9C2B0', capTone: 'silver', backdrop: '#ECEBE6' },
    bestseller: true,
    popularity: 97,
  },
  {
    id: 'byredo-gypsy-water',
    brand: 'Byredo',
    name: 'Gypsy Water',
    concentration: 'edp',
    gender: 'unisex',
    family: 'woody',
    volumes: decant(220, 490, 900),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Хвоя, ладан і ваніль',
    description:
      'Свіжий цитрус і ялівець переходять у соснову хвою, ладан та м’яку ваніль. Легкий, трохи димний аромат, що нагадує вечір біля вогнища в лісі.',
    notes: {
      top: ['Бергамот', 'Лимон', 'Перець', 'Ялівець'],
      heart: ['Ладан', 'Соснова хвоя', 'Ірис'],
      base: ['Амбра', 'Ваніль', 'Сандал'],
    },
    art: { shape: 'square', cap: 'sphere', liquid: '#E8DCC2', capTone: 'black', backdrop: '#EFECE4' },
    featured: true,
    popularity: 84,
  },
  {
    id: 'jhag-not-a-perfume',
    brand: 'Juliette Has a Gun',
    name: 'Not a Perfume',
    concentration: 'edp',
    gender: 'women',
    family: 'musk',
    volumes: decant(120, 250, 450),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Один інгредієнт — амброксан',
    description:
      'Мінімалістичний аромат, побудований на одній молекулі амброксану. Чистий, теплий, «запах шкіри, тільки краще» — непомітний для оточення, але дуже приємний зблизька.',
    notes: {
      top: [],
      heart: [],
      base: ['Амброксан'],
    },
    art: { shape: 'round', cap: 'cylinder', liquid: '#F1E9DE', capTone: 'ivory', backdrop: '#F3F0EB' },
    popularity: 80,
  },
  {
    id: 'margiela-by-the-fireplace',
    brand: 'Maison Margiela',
    name: 'Replica By the Fireplace',
    concentration: 'edt',
    gender: 'unisex',
    family: 'woody',
    volumes: decant(140, 300, 550),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Каштани й дим каміна',
    description:
      'Смажені каштани, гваякове дерево та ваніль — аромат зимового вечора біля каміна. Теплий, димний і дуже затишний.',
    notes: {
      top: ['Рожевий перець', 'Цвіт апельсина', 'Гвоздика'],
      heart: ['Акорд каштана', 'Гваякове дерево', 'Ялівець'],
      base: ['Ваніль', 'Перуанський бальзам', 'Кашмеран'],
    },
    art: { shape: 'square', cap: 'disc', liquid: '#B07A4F', capTone: 'ivory', backdrop: '#EFE6DC' },
    featured: true,
    popularity: 86,
  },
  {
    id: 'kilian-love-dont-be-shy',
    brand: 'Kilian',
    name: 'Love, Don’t Be Shy',
    concentration: 'edp',
    gender: 'women',
    family: 'gourmand',
    volumes: decant(260, 590, 1100),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Цвіт апельсина та маршмелоу',
    description:
      'Солодкий, грайливий аромат із цвітом апельсина, ваніллю та ніжною карамеллю маршмелоу. Обволікаючий і чуттєвий — для тих, хто не боїться солодкого.',
    notes: {
      top: ['Неролі', 'Бергамот', 'Рожевий перець', 'Коріандр'],
      heart: ['Цвіт апельсина', 'Ірис', 'Жасмин', 'Троянда'],
      base: ['Маршмелоу', 'Ваніль', 'Мускус', 'Лабданум'],
    },
    art: { shape: 'flask', cap: 'sphere', liquid: '#E9B9A8', capTone: 'gold', backdrop: '#F6EAE4' },
    featured: true,
    popularity: 88,
  },
  {
    id: 'xerjoff-erba-pura',
    brand: 'Xerjoff',
    name: 'Erba Pura',
    concentration: 'edp',
    gender: 'unisex',
    family: 'amber',
    volumes: decant(240, 540, 990),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Сицилійські цитруси й фрукти',
    description:
      'Яскравий фруктовий старт із сицилійського апельсина й лимона на теплій основі з білого мускусу, ванілі та амбри. Помітний, гучний і дуже стійкий.',
    notes: {
      top: ['Сицилійський апельсин', 'Лимон', 'Бергамот'],
      heart: ['Фруктовий акорд'],
      base: ['Білий мускус', 'Мадагаскарська ваніль', 'Амбра'],
    },
    art: { shape: 'round', cap: 'cube', liquid: '#E7C27A', capTone: 'gold', backdrop: '#F5EEDC' },
    bestseller: true,
    popularity: 90,
  },
  {
    id: 'amouage-interlude-man',
    brand: 'Amouage',
    name: 'Interlude Man',
    concentration: 'edp',
    gender: 'men',
    family: 'amber',
    volumes: decant(280, 640, 1190),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Ладан, орегано й уд',
    description:
      'Димна композиція з ладаном, ладанником та удом, підсвічена прянощами й орегано. Складний, насичений аромат для поціновувачів характерної нішевої парфумерії.',
    notes: {
      top: ['Орегано', 'Перець пімент', 'Бергамот'],
      heart: ['Ладан', 'Амбра', 'Ладанник', 'Опопонакс'],
      base: ['Шкіра', 'Уд', 'Пачулі', 'Сандал'],
    },
    art: { shape: 'faceted', cap: 'tower', liquid: '#4E5A63', capTone: 'silver', backdrop: '#E7E8E6' },
    popularity: 79,
  },
  {
    id: 'tom-ford-lost-cherry',
    brand: 'Tom Ford',
    name: 'Lost Cherry',
    concentration: 'edp',
    gender: 'unisex',
    family: 'gourmand',
    volumes: decant(300, 690, 1290),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Чорна вишня й гіркий мигдаль',
    description:
      'Соковита чорна вишня з вишневим лікером і гірким мигдалем на основі з бальзамів і смаженої тонки. Спокусливий, трохи хмільний гурманський аромат.',
    notes: {
      top: ['Чорна вишня', 'Вишневий лікер', 'Гіркий мигдаль'],
      heart: ['Турецька троянда', 'Жасмин самбак'],
      base: ['Перуанський бальзам', 'Смажена тонка', 'Сандал', 'Ветивер', 'Кедр'],
    },
    art: { shape: 'square', cap: 'cube', liquid: '#8E2F3A', capTone: 'gold', backdrop: '#F4E4E3' },
    featured: true,
    popularity: 89,
  },
  {
    id: 'tom-ford-neroli-portofino',
    brand: 'Tom Ford',
    name: 'Neroli Portofino',
    concentration: 'edp',
    gender: 'unisex',
    family: 'citrus',
    volumes: decant(250, 560, 1050),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Неролі та середземноморський бриз',
    description:
      'Сонячні цитруси, неролі й цвіт апельсина з легким бризом Рив’єри. Свіжий, елегантний аромат для літа та спекотних днів.',
    notes: {
      top: ['Бергамот', 'Мандарин', 'Лимон', 'Лаванда'],
      heart: ['Неролі', 'Цвіт апельсина', 'Жасмин'],
      base: ['Амбра', 'Дягель', 'Амбретта'],
    },
    art: { shape: 'square', cap: 'cube', liquid: '#9FC4CF', capTone: 'gold', backdrop: '#EAF1F1' },
    popularity: 83,
  },
  {
    id: 'frederic-malle-portrait-of-a-lady',
    brand: 'Frédéric Malle',
    name: 'Portrait of a Lady',
    concentration: 'edp',
    gender: 'women',
    family: 'floral',
    volumes: decant(300, 690, 1290),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Троянда, пачулі й ладан',
    description:
      'Розкішна темна троянда в обрамленні пачулі, ладану та прянощів. Глибокий, багатошаровий аромат із прекрасною стійкістю — справжній портрет сильного характеру.',
    notes: {
      top: ['Троянда', 'Малина', 'Чорна смородина', 'Гвоздика', 'Кориця'],
      heart: ['Пачулі', 'Ладан', 'Сандал'],
      base: ['Мускус', 'Бензоїн', 'Амбра'],
    },
    art: { shape: 'tall', cap: 'cube', liquid: '#7E2B35', capTone: 'black', backdrop: '#F1E3E2' },
    featured: true,
    popularity: 85,
  },
  {
    id: 'pdm-delina',
    brand: 'Parfums de Marly',
    name: 'Delina',
    concentration: 'edp',
    gender: 'women',
    family: 'floral',
    volumes: decant(260, 590, 1100),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Турецька троянда та лічі',
    description:
      'Свіжа троянда з лічі, ревенем і півонією на м’якій мускусній основі. Ніжний, жіночний і помітний аромат, який часто обирають у подарунок.',
    notes: {
      top: ['Лічі', 'Ревінь', 'Бергамот', 'Мускатний горіх'],
      heart: ['Турецька троянда', 'Півонія', 'Ваніль'],
      base: ['Кашмеран', 'Мускус', 'Ветивер', 'Ладан'],
    },
    art: { shape: 'flask', cap: 'disc', liquid: '#EDB8C4', capTone: 'gold', backdrop: '#F7EAEC' },
    bestseller: true,
    popularity: 91,
  },
  {
    id: 'diptyque-philosykos',
    brand: 'Diptyque',
    name: 'Philosykos',
    concentration: 'edt',
    gender: 'unisex',
    family: 'green',
    volumes: decant(160, 350, 650),
    defaultVolume: DEFAULT_DECANT,
    tagline: 'Інжирове дерево цілком',
    description:
      'Зелене листя, соковитий інжир і деревина фігового дерева. Природний, світлий аромат, що переносить у середземноморський сад під теплим сонцем.',
    notes: {
      top: ['Листя інжиру'],
      heart: ['Інжир', 'Зелені ноти', 'Кокос'],
      base: ['Деревина інжиру', 'Кедр'],
    },
    art: { shape: 'flask', cap: 'cylinder', liquid: '#B9C7A2', capTone: 'ivory', backdrop: '#EDF0E6' },
    popularity: 77,
  },
];

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

/** Об'єм і ціна, що показуються в картці та використовуються у фільтрі ціни. */
export const cardVolume = (p: Product) => p.volumes[p.defaultVolume] ?? p.volumes[0];

export const PRICE_BOUNDS = {
  min: Math.floor(Math.min(...PRODUCTS.map((p) => cardVolume(p).price)) / 50) * 50,
  max: Math.ceil(Math.max(...PRODUCTS.map((p) => cardVolume(p).price)) / 50) * 50,
};
