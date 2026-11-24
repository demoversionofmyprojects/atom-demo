import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONCENTRATION_LABELS, FAMILY_LABELS, GENDER_LABELS } from '../data/dictionaries';
import { getProduct } from '../data/products';
import type { Product } from '../data/types';
import { formatPrice } from '../lib/format';
import { flyToCart, morphIn, morphOut } from '../lib/motion';
import { haptic } from '../lib/telegram';
import { useApp } from '../store/AppContext';
import { BottleArt } from './BottleArt';
import { Chromatogram } from './Chromatogram';
import { FavoriteButton } from './FavoriteButton';
import { CheckIcon } from './Icons';
import { RollingNumber } from './RollingNumber';
import { Sheet } from './Sheet';

export function ProductSheet() {
  const { openedProductId } = useApp();
  // Пам'ятаємо останній товар, щоб шторка могла плавно закритися з контентом
  const last = useRef<Product>();
  const current = openedProductId ? getProduct(openedProductId) : undefined;
  if (current) last.current = current;
  const product = current ?? last.current;
  return product ? <ProductDetails key={product.id} product={product} open={!!current} /> : null;
}

function ProductDetails({ product, open }: { product: Product; open: boolean }) {
  const { closeProduct, addToCart, filters } = useApp();
  // Відкриваємо на тому об'ємі, який покупець обрав у каталозі
  const [volumeIdx, setVolumeIdx] = useState(() => Math.max(0, product.volumes.findIndex((v) => v.ml === filters.ml)));
  const [added, setAdded] = useState(false);
  const [morphed, setMorphed] = useState(false);
  const addedTimer = useRef<number>();
  const mediaRef = useRef<HTMLDivElement>(null);
  const volume = product.volumes[volumeIdx] ?? product.volumes[0];

  // Флакон прилітає з картки, з якої відкрили товар, і повертається туди при закритті
  const morphStarted = useRef(false);
  useLayoutEffect(() => {
    // Ref-запобіжник: у StrictMode ефект викликається двічі, а політ має бути один
    if (morphStarted.current || !open || !mediaRef.current) return;
    morphStarted.current = true;
    setMorphed(morphIn(product.id, mediaRef.current, product.art.backdrop));
  }, []);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open && mediaRef.current) morphOut(product.id, mediaRef.current, product.art.backdrop);
    wasOpen.current = open;
  }, [open, product]);

  const handleAdd = () => {
    flyToCart(mediaRef.current);
    addToCart(product.id, volume.ml);
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Sheet
      open={open}
      onClose={closeProduct}
      className="sheet--product"
      footer={
        <div className="buy-bar">
          <div className="buy-bar__price">
            <span className="buy-bar__label">
              <RollingNumber value={String(volume.ml)} /> мл
            </span>
            <strong>
              <RollingNumber value={formatPrice(volume.price)} />
            </strong>
          </div>
          <FavoriteButton productId={product.id} className="icon-btn icon-btn--bordered" size={20} />
          <button className={`btn btn--primary buy-bar__cta${added ? ' is-added' : ''}`} onClick={handleAdd}>
            <span className="buy-bar__cta-label" key={String(added)}>
              {added ? (
                <>
                  <CheckIcon size={18} /> Додано
                </>
              ) : (
                'Додати до кошика'
              )}
            </span>
          </button>
        </div>
      }
    >
      <div className="detail">
        <div
          className={`detail__media${morphed ? ' is-morphed' : ''}`}
          ref={mediaRef}
          style={{ background: product.art.backdrop }}
        >
          <BottleArt product={product} className="detail__img" live />
        </div>

        <div className="detail__info">
          <span className="detail__brand">{product.brand}</span>
          <h2 className="detail__name">{product.name}</h2>
          <p className="detail__tagline">{product.tagline}</p>

          <div className="tags">
            <span className="tag">{CONCENTRATION_LABELS[product.concentration].full}</span>
            <span className="tag">{FAMILY_LABELS[product.family]}</span>
            <span className="tag">{GENDER_LABELS[product.gender]}</span>
          </div>

          <p className="detail__desc">{product.description}</p>

          <h3 className="section-label">Піраміда аромату</h3>
          <Chromatogram product={product} variant="full" />

          <h3 className="section-label">Об’єм розпиву</h3>
          <VolumePicker product={product} value={volumeIdx} onChange={setVolumeIdx} />
        </div>
      </div>
    </Sheet>
  );
}

/** Вибір об'єму: золота рамка плавно переїжджає між варіантами. */
function VolumePicker({ product, value, onChange }: { product: Product; value: number; onChange: (i: number) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.children[value + 1] as HTMLElement | undefined; // [0] — сама рамка
      if (el) setThumb({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [value]);

  return (
    <div className="volumes" role="radiogroup" aria-label="Оберіть об’єм" ref={listRef}>
      <span
        className="volumes__thumb"
        aria-hidden
        style={
          thumb
            ? { transform: `translate(${thumb.x}px, ${thumb.y}px)`, width: thumb.w, height: thumb.h }
            : { opacity: 0 }
        }
      />
      {product.volumes.map((v, i) => (
        <button
          key={v.ml}
          role="radio"
          aria-checked={i === value}
          className={`volume${i === value ? ' is-active' : ''}`}
          onClick={() => {
            haptic.select();
            onChange(i);
          }}
        >
          <span className="volume__ml">{v.ml} мл</span>
          <span className="volume__price">{formatPrice(v.price)}</span>
        </button>
      ))}
    </div>
  );
}
