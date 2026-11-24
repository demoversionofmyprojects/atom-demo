import { useEffect, useRef } from 'react';
import { BottleArt } from '../components/BottleArt';
import { ArrowRightIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { SplitText } from '../components/SplitText';
import { FAMILY_HINTS, FAMILY_LABELS } from '../data/dictionaries';
import { KIND_COLORS } from '../data/notes';
import { PRODUCTS } from '../data/products';
import type { Family } from '../data/types';
import { formatPrice } from '../lib/format';
import { prefersReducedMotion, setMorphOrigin, useScrollFrame } from '../lib/motion';
import { useApp } from '../store/AppContext';
import { freshFilters } from '../store/filters';

const FEATURED = PRODUCTS.filter((p) => p.featured);
const BESTSELLERS = PRODUCTS.filter((p) => p.bestseller)
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);
// Склад колекції: скільки ароматів кожної родини — смуга спектра на головній
const COMPOSITION = (Object.keys(FAMILY_LABELS) as Family[])
  .map((fam) => ({ fam, count: PRODUCTS.filter((p) => p.family === fam).length }))
  .filter((c) => c.count > 0);

const HOME_FAMILIES: Family[] = ['woody', 'amber', 'floral', 'gourmand', 'citrus', 'chypre'];

const TITLE_LEAD = 'Аромат, що звучить';
const TITLE_ACCENT = 'саме як ви';

export function HomeScreen() {
  const { setTab, setFilters, openProduct } = useApp();
  const heroRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const openCatalog = (family?: Family) => {
    setFilters((f) => ({ ...freshFilters(f.ml), families: family ? [family] : [] }));
    setTab('catalog');
  };

  // Hero повільно відстає від прокрутки й тьмяніє — глибина без різкого паралаксу
  useScrollFrame(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const y = prefersReducedMotion() ? 0 : Math.min(window.scrollY, 600);
    hero.style.setProperty('--hero-shift', `${(y * 0.18).toFixed(1)}px`);
    hero.style.setProperty('--hero-fade', (1 - Math.min(y / 520, 0.6)).toFixed(3));
  });

  // Каруселі «Вибір тижня»: картка в фокусі — повного розміру, сусідні трохи відступають,
  // а флакон усередині зсувається повільніше за картку
  useEffect(() => {
    const track = carouselRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      const anchor = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft || '0');
      Array.from(track.children).forEach((child) => {
        const el = child as HTMLElement;
        const r = el.getBoundingClientRect();
        const offset = (r.left - anchor) / r.width; // 0 — у фокусі, 1 — наступна
        const focus = Math.max(0, 1 - Math.abs(offset));
        el.style.setProperty('--focus', focus.toFixed(3));
        el.style.setProperty('--shift', `${(Math.max(-1, Math.min(1, offset)) * -14).toFixed(1)}px`);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="screen home">
      <section className="hero" ref={heroRef}>
        <div className="hero__logo-wrap">
          <img className="hero__logo" src="./logo.png" alt="Atom Parfums" />
          <span className="hero__glint" aria-hidden />
        </div>
        <h1 className="hero__title" aria-label={`${TITLE_LEAD} ${TITLE_ACCENT}`}>
          <span aria-hidden>
            <SplitText text={TITLE_LEAD} />{' '}
            <em>
              <SplitText text={TITLE_ACCENT} start={TITLE_LEAD.split(' ').length} />
            </em>
          </span>
        </h1>
        <div className="composition" aria-label="Склад колекції" role="group">
          <div className="composition__band">
            {COMPOSITION.map(({ fam, count }) => (
              <button
                key={fam}
                className="composition__seg"
                style={{ flexGrow: count, background: KIND_COLORS[fam] }}
                onClick={() => openCatalog(fam)}
                aria-label={`${FAMILY_LABELS[fam]}: ${count}`}
              />
            ))}
          </div>
          <p className="composition__caption">
            Склад колекції: {PRODUCTS.length} ароматів, {COMPOSITION.length} родин
          </p>
        </div>
        <p className="hero__text">
          Розпив нішевої та люксової парфумерії в атомайзерах 2, 5 і 10 мл. Спробуйте культові аромати, перш
          ніж обирати повний флакон: шукайте за нотами чи родиною й формуйте замовлення просто в Telegram.
        </p>
        <button className="btn btn--primary hero__cta" onClick={() => openCatalog()}>
          Перейти до каталогу <ArrowRightIcon size={18} />
        </button>
      </section>


      <section className="section">
        <div className="section__head reveal">
          <h2 className="section__title">Вибір тижня</h2>
          <button className="link-btn" onClick={() => openCatalog()}>
            Усі аромати
          </button>
        </div>
        <div className="carousel" role="list" ref={carouselRef}>
          {FEATURED.map((p) => (
            <button
              key={p.id}
              className="spotlight reveal"
              role="listitem"
              onClick={(e) => {
                setMorphOrigin(p.id, e.currentTarget.querySelector('.spotlight__media'));
                openProduct(p.id);
              }}
            >
              <div className="spotlight__media" data-morph-id={p.id}>
                <BottleArt product={p} className="spotlight__img" />
              </div>
              <div className="spotlight__body">
                <span className="card__brand">{p.brand}</span>
                <span className="spotlight__name">{p.name}</span>
                <span className="spotlight__tagline">{p.tagline}</span>
                <span className="spotlight__price">від {formatPrice(Math.min(...p.volumes.map((v) => v.price)))}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head reveal">
          <h2 className="section__title">Родини ароматів</h2>
        </div>
        <div className="families">
          {HOME_FAMILIES.map((fam) => (
            <button key={fam} className="family reveal" onClick={() => openCatalog(fam)}>
              <span className="family__band" style={{ background: KIND_COLORS[fam] }} aria-hidden />
              <span className="family__name">{FAMILY_LABELS[fam]}</span>
              <span className="family__hint">{FAMILY_HINTS[fam]}</span>
              <span className="family__count">{PRODUCTS.filter((p) => p.family === fam).length}</span>
              <ArrowRightIcon size={16} className="family__arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head reveal">
          <h2 className="section__title">Варто спробувати</h2>
          <button
            className="link-btn"
            onClick={() => {
              setFilters((f) => freshFilters(f.ml));
              setTab('catalog');
            }}
          >
            Дивитися всі
          </button>
        </div>
        <div className="grid">
          {BESTSELLERS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <aside className="demo-note reveal">
        <span className="demo-note__mark">Демо</span>
        Це презентаційний прототип. Аромати реальні, але ціни, наявність та ілюстрації флаконів
        демонстраційні й не є актуальним прайсом магазину.
      </aside>
    </div>
  );
}
