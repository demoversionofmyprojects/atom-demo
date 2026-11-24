import { useRef } from 'react';
import { CONCENTRATION_LABELS } from '../data/dictionaries';
import { volumeFor } from '../data/products';
import type { Product } from '../data/types';
import { formatPrice } from '../lib/format';
import { setMorphOrigin, useTilt } from '../lib/motion';
import { useApp } from '../store/AppContext';
import { BottleArt } from './BottleArt';
import { Chromatogram } from './Chromatogram';
import { FavoriteButton } from './FavoriteButton';

/** Картка аромату. `dense` — рядок щільного списку для тих, хто знає, що шукає. */
export function ProductCard({ product, dense = false }: { product: Product; dense?: boolean }) {
  const { openProduct, filters } = useApp();
  const volume = volumeFor(product, filters.ml);
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef);

  const open = () => {
    setMorphOrigin(product.id, mediaRef.current);
    openProduct(product.id);
  };

  if (dense) {
    return (
      <article className="row reveal">
        <button className="row__open" onClick={open} aria-label={`Відкрити ${product.name}`}>
          <div className="row__media" ref={mediaRef} data-morph-id={product.id}>
            <BottleArt product={product} className="row__img" />
          </div>
          <Chromatogram product={product} variant="strip" />
          <span className="row__text">
            <span className="card__brand">{product.brand}</span>
            <span className="row__name">{product.name}</span>
          </span>
          <span className="row__price">{formatPrice(volume.price)}</span>
        </button>
        <FavoriteButton productId={product.id} className="icon-btn row__fav" />
      </article>
    );
  }

  return (
    <article className="card reveal" ref={cardRef}>
      <button className="card__open" onClick={open} aria-label={`Відкрити ${product.name}`}>
        <div className="card__media">
          <Chromatogram product={product} variant="strip" />
          <div className="card__bottle" ref={mediaRef} data-morph-id={product.id}>
            <BottleArt product={product} className="card__img" />
          </div>
          <span className="card__glare" aria-hidden />
        </div>
        <div className="card__body">
          <span className="card__brand">{product.brand}</span>
          <h3 className="card__name">{product.name}</h3>
          <span className="card__meta">
            <span>
              {CONCENTRATION_LABELS[product.concentration].short} · {volume.ml} мл
            </span>
            <span className="card__price">{formatPrice(volume.price)}</span>
          </span>
        </div>
      </button>
      <FavoriteButton productId={product.id} className="fav-btn" />
    </article>
  );
}
