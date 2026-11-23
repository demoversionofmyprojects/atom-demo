import type { Concentration, Family, Gender } from './types';

export const FAMILY_LABELS: Record<Family, string> = {
  woody: 'Деревні',
  floral: 'Квіткові',
  amber: 'Амброві',
  citrus: 'Цитрусові',
  chypre: 'Шипрові',
  gourmand: 'Гурманські',
  spicy: 'Пряні',
  green: 'Зелені',
  musk: 'Мускусні',
};

export const FAMILY_HINTS: Record<Family, string> = {
  woody: 'Сандал, кедр, ветивер',
  floral: 'Троянда, ірис, жасмин',
  amber: 'Смоли, уд, ладан',
  citrus: 'Бергамот, неролі, лимон',
  chypre: 'Бергамот, мох, пачулі',
  gourmand: 'Ваніль, мед, тонка',
  spicy: 'Кардамон, перець, шафран',
  green: 'Інжир, листя, трави',
  musk: 'Чисті мускуси, шкіра',
};

export const GENDER_LABELS: Record<Gender, string> = {
  women: 'Жіночі',
  men: 'Чоловічі',
  unisex: 'Унісекс',
};

export const CONCENTRATION_LABELS: Record<Concentration, { full: string; short: string }> = {
  edt: { full: 'Туалетна вода', short: 'EDT' },
  edp: { full: 'Парфумована вода', short: 'EDP' },
  extrait: { full: 'Екстракт парфумів', short: 'Extrait' },
};
