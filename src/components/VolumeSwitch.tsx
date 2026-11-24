import { motion } from 'motion/react';
import { DECANT_SIZES, priceBounds, type DecantMl } from '../data/products';
import { haptic } from '../lib/telegram';
import { useApp } from '../store/AppContext';

/** Глобальний перемикач об'єму розпиву: перераховує ціни всієї сітки одразу. */
export function VolumeSwitch() {
  const { filters, setFilters } = useApp();

  const choose = (ml: DecantMl) => {
    if (ml === filters.ml) return;
    haptic.select();
    const b = priceBounds(ml);
    // Діапазон ціни іншого об'єму інший, тож фільтр ціни скидається на повний
    setFilters((f) => ({ ...f, ml, price: [b.min, b.max] }));
  };

  return (
    <div className="ml-switch" role="radiogroup" aria-label="Об’єм розпиву для цін">
      {DECANT_SIZES.map((ml) => (
        <button
          key={ml}
          role="radio"
          aria-checked={filters.ml === ml}
          className={`ml-switch__item${filters.ml === ml ? ' is-active' : ''}`}
          onClick={() => choose(ml)}
        >
          {filters.ml === ml && (
            <motion.span
              layoutId="ml-switch-pill"
              className="ml-switch__pill"
              transition={{ type: 'spring', stiffness: 520, damping: 40 }}
            />
          )}
          <span className="ml-switch__label">{ml} мл</span>
        </button>
      ))}
    </div>
  );
}
