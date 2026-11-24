import { animate, stagger } from 'animejs';
import { useEffect, useRef } from 'react';
import { noteColor } from '../data/notes';
import type { Product } from '../data/types';
import { prefersReducedMotion } from '../lib/motion';

const LEVELS = [
  { key: 'top', label: 'Верхні ноти' },
  { key: 'heart', label: 'Ноти серця' },
  { key: 'base', label: 'Базові ноти' },
] as const;

/**
 * Склад аромату як хроматограма: кожна нота — смужка свого кольору,
 * шари йдуть від найлеткіших (верх) до найстійкіших (база).
 * `strip` — компактна смуга для картки, `full` — розгорнута для сторінки товару.
 */
export function Chromatogram({ product, variant }: { product: Product; variant: 'strip' | 'full' }) {
  const levels = LEVELS.filter(({ key }) => product.notes[key].length);
  const ref = useRef<HTMLOListElement>(null);

  // Шари «проявляються» згори вниз, як фарба, що піднімається хроматографічним папером
  useEffect(() => {
    const root = ref.current;
    if (variant !== 'full' || !root || prefersReducedMotion()) return;
    const bands = animate(root.querySelectorAll('.chroma__band'), {
      scaleY: [0, 1],
      delay: stagger(70, { start: 320 }),
      duration: 900,
      ease: 'outExpo',
    });
    const names = animate(root.querySelectorAll('.chroma__note, .chroma__level'), {
      opacity: [0, 1],
      translateX: [-8, 0],
      delay: stagger(70, { start: 380 }),
      duration: 700,
      ease: 'outExpo',
    });
    return () => {
      bands.revert();
      names.revert();
    };
  }, [variant, product.id]);

  if (variant === 'strip') {
    return (
      <span className="chroma chroma--strip" aria-hidden>
        {levels.map(({ key }) => (
          <span className="chroma__layer" key={key}>
            {product.notes[key].map((note) => (
              <i key={note} style={{ background: noteColor(note, product) }} />
            ))}
          </span>
        ))}
      </span>
    );
  }

  return (
    <ol className="chroma chroma--full" ref={ref} aria-label="Піраміда аромату">
      {levels.map(({ key, label }) => (
        <li key={key} className="chroma__group">
          <span className="chroma__level">{label}</span>
          <ul>
            {product.notes[key].map((note) => (
              <li key={note} className="chroma__row">
                <i className="chroma__band" style={{ background: noteColor(note, product) }} aria-hidden />
                <span className="chroma__note">{note}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
