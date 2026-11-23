import { useRef } from 'react';
import { CONCENTRATION_LABELS } from '../data/dictionaries';
import { cardVolume } from '../data/products';
import type { Product } from '../data/types';
import { formatPrice } from '../lib/format';
import { setMorphOrigin, useTilt } from '../lib/motion';
import { useApp } from '../store/AppContext';
import { BottleArt } from './BottleArt';
import { FavoriteButton } from './FavoriteButton';

export function ProductCard({ product }: { product: Product }) {
  const { openProduct } = useApp();
  const volume = cardVolume(product);
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  useTilt(cardRef);

  return (
    <article className="card reveal" data-flip-id={product.id} ref={cardRef}>
      <button
        className="card__open"
        onClick={() => {
          setMorphOrigin(product.id, mediaRef.current);
          openProduct(product.id);
        }}
        aria-label={`Відкрити ${product.name}`}
      >
        <div className="card__media" ref={mediaRef} data-morph-id={product.id}>
          <BottleArt product={product} className="card__img" />
          <span className="card__glare" aria-hidden />
          {product.bestseller && <span className="badge">Хіт</span>}
        </div>
        <div className="card__body">
          <span className="card__brand">{product.brand}</span>
          <h3 className="card__name">{product.name}</h3>
          <span className="card__meta">
            {CONCENTRATION_LABELS[product.concentration].short} · {volume.ml} мл
          </span>
          <span className="card__price">{formatPrice(volume.price)}</span>
        </div>
      </button>
      <FavoriteButton productId={product.id} className="fav-btn" />
    </article>
  );
}
