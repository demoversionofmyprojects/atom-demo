import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { HeartIcon } from './Icons';

/**
 * Кнопка «в обране». Додавання — серце «наливається» з легким перебільшенням
 * і розсипає золоті іскри; прибирання — м'яко здувається.
 */
export function FavoriteButton({ productId, className, size = 18 }: { productId: string; className: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(productId);
  // Лічильник натискань: анімуємо лише після дії користувача, а не при кожному рендері
  const [taps, setTaps] = useState(0);

  return (
    <button
      className={`${className}${fav ? ' is-active' : ''}`}
      onClick={() => {
        setTaps((t) => t + 1);
        toggleFavorite(productId);
      }}
      aria-pressed={fav}
      aria-label={fav ? 'Прибрати з обраного' : 'Додати до обраного'}
    >
      <span className={`fav-icon${taps ? (fav ? ' is-liked' : ' is-unliked') : ''}`} key={taps}>
        <HeartIcon size={size} filled={fav} />
      </span>
      {fav && taps > 0 && <span className="fav-burst" key={`b${taps}`} aria-hidden />}
    </button>
  );
}
