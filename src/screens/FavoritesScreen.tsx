import { EmptyState } from '../components/EmptyState';
import { HeartIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { getProduct } from '../data/products';
import type { Product } from '../data/types';
import { useRef } from 'react';
import { plural } from '../lib/format';
import { useFlip } from '../lib/motion';
import { useApp } from '../store/AppContext';

export function FavoritesScreen() {
  const { favorites, setTab } = useApp();
  const items = favorites.map(getProduct).filter((p): p is Product => !!p);
  const gridRef = useRef<HTMLDivElement>(null);
  useFlip(gridRef, favorites.join());

  return (
    <div className="screen">
      <PageHeader
        title="Обране"
        subtitle={
          items.length
            ? `${items.length} ${plural(items.length, ['аромат', 'аромати', 'ароматів'])} у вашій колекції`
            : 'Ваша особиста колекція'
        }
      />
      {items.length ? (
        <div className="grid" ref={gridRef}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<HeartIcon size={28} />}
          title="Тут поки порожньо"
          text="Натискайте на серце в картці аромату, щоб зберегти його. Обрані аромати завжди будуть під рукою."
          action={{ label: 'До каталогу', onClick: () => setTab('catalog') }}
        />
      )}
    </div>
  );
}
