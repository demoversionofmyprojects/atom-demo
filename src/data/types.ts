export type Gender = 'women' | 'men' | 'unisex';

export type Family =
  | 'woody'
  | 'floral'
  | 'amber'
  | 'citrus'
  | 'chypre'
  | 'gourmand'
  | 'spicy'
  | 'green'
  | 'musk';

export type Concentration = 'edt' | 'edp' | 'extrait';

export interface Volume {
  ml: number;
  price: number; // ₴
}

/** Параметри SVG-ілюстрації флакона (тимчасова заміна фото). */
export interface BottleArt {
  shape: 'square' | 'round' | 'tall' | 'faceted' | 'flask';
  cap: 'cube' | 'cylinder' | 'sphere' | 'tower' | 'disc';
  liquid: string; // колір рідини
  capTone: 'gold' | 'black' | 'ivory' | 'wood' | 'silver';
  backdrop: string; // м'який фон картки
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  concentration: Concentration;
  gender: Gender;
  family: Family;
  volumes: Volume[];
  /** Індекс об'єму, що показується в картці за замовчуванням. */
  defaultVolume: number;
  tagline: string;
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  art: BottleArt;
  /** Шлях до справжнього фото. Якщо заданий — використовується замість ілюстрації. */
  image?: string;
  featured?: boolean;
  /** Хіт продажів — бейдж у картці й добірка на головній. */
  bestseller?: boolean;
  popularity: number;
}
