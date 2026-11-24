import { motion } from 'motion/react';
import { FAMILY_LABELS } from '../data/dictionaries';
import { KIND_COLORS } from '../data/notes';
import type { Family } from '../data/types';
import { haptic } from '../lib/telegram';
import { useApp } from '../store/AppContext';

// Короткі підписи, щоб усі дев'ять родин вміщалися в одну смугу на телефоні
const SHORT: Record<Family, string> = {
  woody: 'Деревні',
  floral: 'Квіткові',
  amber: 'Амброві',
  citrus: 'Цитрус',
  chypre: 'Шипр',
  gourmand: 'Гурман',
  spicy: 'Пряні',
  green: 'Зелені',
  musk: 'Мускус',
};

/**
 * Фільтр родин як суцільна смуга спектра зі шкалою: кольори ті самі, що в хроматограмах.
 * Підписи чергуються над і під смугою, кожен на своїй поділці.
 */
export function SpectrumFilter() {
  const { filters, setFilters } = useApp();

  const toggle = (fam: Family) => {
    haptic.select();
    setFilters((f) => ({
      ...f,
      families: f.families.includes(fam) ? f.families.filter((x) => x !== fam) : [...f.families, fam],
    }));
  };

  return (
    <div className="spectrum" role="group" aria-label="Родина аромату">
      {(Object.keys(FAMILY_LABELS) as Family[]).map((fam, i) => {
        const active = filters.families.includes(fam);
        const dimmed = filters.families.length > 0 && !active;
        return (
          <button
            key={fam}
            className={`spectrum__item ${i % 2 ? 'is-above' : 'is-below'}${active ? ' is-active' : ''}${dimmed ? ' is-dimmed' : ''}`}
            onClick={() => toggle(fam)}
            aria-pressed={active}
            aria-label={FAMILY_LABELS[fam]}
          >
            <span className="spectrum__label" aria-hidden>
              {SHORT[fam]}
            </span>
            <motion.span
              className="spectrum__band"
              style={{ background: KIND_COLORS[fam] }}
              animate={{ scaleY: active ? 1.45 : 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          </button>
        );
      })}
    </div>
  );
}
