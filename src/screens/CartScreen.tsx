import { useState, type MouseEvent } from 'react';
import { BottleArt } from '../components/BottleArt';
import { EmptyState } from '../components/EmptyState';
import { BagIcon, MinusIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { PageHeader } from '../components/PageHeader';
import { RollingNumber } from '../components/RollingNumber';
import { CONCENTRATION_LABELS } from '../data/dictionaries';
import { getProduct } from '../data/products';
import { formatPrice, plural } from '../lib/format';
import { collapseOut } from '../lib/motion';
import { useApp } from '../store/AppContext';

export function CartScreen() {
  const { cart, cartCount, cartTotal, setQty, removeFromCart, setTab, openProduct } = useApp();
  const [demoNotice, setDemoNotice] = useState(false);

  const handleRemove = async (e: MouseEvent<HTMLButtonElement>, productId: string, ml: number) => {
    const row = e.currentTarget.closest('li');
    if (row) await collapseOut(row);
    removeFromCart(productId, ml);
  };

  if (!cart.length) {
    return (
      <div className="screen">
        <PageHeader title="Кошик" subtitle="Ваше замовлення" />
        <EmptyState
          icon={<BagIcon size={28} />}
          title="Кошик порожній"
          text="Додайте аромати з каталогу — тут з’явиться підсумок вашого замовлення."
          action={{ label: 'Обрати аромат', onClick: () => setTab('catalog') }}
        />
      </div>
    );
  }

  return (
    <div className="screen cart">
      <PageHeader
        title="Кошик"
        subtitle={`${cartCount} ${plural(cartCount, ['товар', 'товари', 'товарів'])}`}
      />

      <div className="cart__layout">
        <ul className="cart__list">
          {cart.map((item) => {
            const product = getProduct(item.productId);
            const volume = product?.volumes.find((v) => v.ml === item.ml);
            if (!product || !volume) return null;
            return (
              <li className="cart-item" key={`${item.productId}-${item.ml}`}>
                <button className="cart-item__media" onClick={() => openProduct(product.id)} aria-label={product.name}>
                  <BottleArt product={product} className="cart-item__img" />
                </button>
                <div className="cart-item__info">
                  <span className="card__brand">{product.brand}</span>
                  <span className="cart-item__name">{product.name}</span>
                  <span className="card__meta">
                    {CONCENTRATION_LABELS[product.concentration].short} · {item.ml} мл · {formatPrice(volume.price)}
                  </span>
                  <div className="cart-item__row">
                    <div className="stepper" aria-label="Кількість">
                      <button
                        onClick={() => setQty(item.productId, item.ml, item.qty - 1)}
                        disabled={item.qty <= 1}
                        aria-label="Зменшити кількість"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span aria-live="polite">
                        <RollingNumber value={String(item.qty)} />
                      </span>
                      <button
                        onClick={() => setQty(item.productId, item.ml, item.qty + 1)}
                        disabled={item.qty >= 10}
                        aria-label="Збільшити кількість"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                    <strong className="cart-item__sum">
                      <RollingNumber value={formatPrice(volume.price * item.qty)} />
                    </strong>
                  </div>
                </div>
                <button
                  className="icon-btn cart-item__remove"
                  onClick={(e) => handleRemove(e, item.productId, item.ml)}
                  aria-label="Видалити з кошика"
                >
                  <TrashIcon size={18} />
                </button>
              </li>
            );
          })}
        </ul>

        <section className="summary">
          <h2 className="section__title">Підсумок</h2>
          <div className="summary__row">
            <span>
              Товари (<RollingNumber value={String(cartCount)} />)
            </span>
            <RollingNumber value={formatPrice(cartTotal)} />
          </div>
          <div className="summary__row summary__row--muted">
            <span>Доставка</span>
            <span>за тарифами перевізника</span>
          </div>
          <div className="summary__total">
            <span>Разом</span>
            <strong>
              <RollingNumber value={formatPrice(cartTotal)} />
            </strong>
          </div>
          <button className="btn btn--primary btn--block" onClick={() => setDemoNotice(true)}>
            Оформити замовлення
          </button>
          <div className={`summary__notice-wrap${demoNotice ? ' is-open' : ''}`}>
            <p className="summary__notice" role="status" aria-hidden={!demoNotice}>
              Це демо-версія: замовлення не надсилається і оплата не проводиться. Оформлення з’явиться у
              повній версії застосунку.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
