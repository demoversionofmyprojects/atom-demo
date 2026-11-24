import { useEffect, type RefObject } from 'react';
import { flushSync } from 'react-dom';

/**
 * Рухова ідентичність Atom Parfums — «Premium».
 *  - фірмова крива появи: EASE.emph (сильне гальмування в кінці, як у дорогих інтерфейсах);
 *  - палітра тривалостей: 180 / 360 / 620 мс;
 *  - єдиний патерн появи: підйом + проявлення, герої — ще й маска.
 * Ті самі значення продубльовано CSS-токенами в motion.css.
 */
export const EASE = {
  emph: 'cubic-bezier(0.05, 0.7, 0.1, 1)', // поява героїв, переходи
  out: 'cubic-bezier(0.22, 1, 0.36, 1)', // звичайна поява
  in: 'cubic-bezier(0.3, 0, 0.8, 0.15)', // зникнення
  std: 'cubic-bezier(0.4, 0, 0.2, 1)', // переміщення на екрані
};

export const DUR = { quick: 180, std: 360, slow: 620 };

/* ---------- Режим руху ---------- */

const FULL_MOTION_KEY = 'atom-parfums:motion';

/**
 * Системне «зменшити рух» поважаємо за замовчуванням (лишаються м'які проявлення).
 * Для показу демо можна явно ввімкнути повну анімацію параметром ?motion=full.
 */
export function initMotion() {
  const root = document.documentElement;
  const param = new URLSearchParams(location.search).get('motion');
  try {
    if (param === 'full' || param === 'system') sessionStorage.setItem(FULL_MOTION_KEY, param);
  } catch {
    /* без збереження — режим діє лише для поточного завантаження */
  }
  let forced = param;
  try {
    forced = forced ?? sessionStorage.getItem(FULL_MOTION_KEY);
  } catch {
    /* ігноруємо */
  }

  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const apply = () => root.classList.toggle('reduce-motion', forced !== 'full' && !!query?.matches);
  apply();
  query?.addEventListener?.('change', apply);
  root.classList.toggle('has-vt', supportsViewTransitions());
}

export const prefersReducedMotion = () => document.documentElement.classList.contains('reduce-motion');

const canHover = () => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

/* ---------- Перехід між екранами ---------- */

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

/**
 * Змінює екран через View Transitions API (старий екран відходить, новий заїжджає),
 * а там, де API немає, — просто оновлює стан (працює CSS-анімація входу).
 */
export function transitionScreen(update: () => void, direction: 1 | -1) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  document.documentElement.dataset.navDir = direction > 0 ? 'forward' : 'back';
  doc.startViewTransition(() => flushSync(update));
}

export const supportsViewTransitions = () => !!(document as ViewTransitionDoc).startViewTransition;

/* ---------- Поява елементів під час прокручування ---------- */

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      // Елементи, що з'явилися разом, отримують каскад зверху вниз і зліва направо
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((entry, k) => {
          const el = entry.target as HTMLElement;
          el.style.setProperty('--reveal-delay', `${Math.min(k, 5) * 70}ms`);
          el.classList.add('is-revealed');
          observer?.unobserve(el);
        });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  return observer;
}

/** Підписує всі ще не показані `.reveal`-елементи всередині root на появу. */
export function revealWithin(root: ParentNode | null) {
  if (!root) return;
  const pending = root.querySelectorAll<HTMLElement>('.reveal:not(.is-revealed)');
  if (!('IntersectionObserver' in window)) {
    pending.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  const io = getObserver();
  pending.forEach((el) => io.observe(el));
}

/* ---------- Спільний елемент: флакон летить з картки в шторку ---------- */

/**
 * Виконує cleanup по завершенні анімації, а для надійності — ще й таймером:
 * у фонових вкладках анімації можуть «замерзнути», і подія finish не прийде.
 */
function onDone(animation: Animation, duration: number, cleanup: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
  };
  animation.onfinish = run;
  window.setTimeout(run, duration + 250);
}

let morphOrigin: { id: string; el: HTMLElement } | null = null;

/** Запам'ятовує, з якого зображення відкрито товар. */
export function setMorphOrigin(id: string, el: HTMLElement | null) {
  morphOrigin = el ? { id, el } : null;
}

let cloneSeq = 0;

/**
 * Копія ілюстрації з власними id градієнтів і масок. Інакше url(#id) у копії
 * посилається на оригінал, а той під час польоту прихований — і заливка зникає.
 */
function cloneArt(source: Element) {
  const art = source.querySelector('svg, img')?.cloneNode(true) as HTMLElement | SVGElement | undefined;
  if (!art || art.tagName.toLowerCase() !== 'svg') return art;
  const suffix = `-c${++cloneSeq}`;
  art.querySelectorAll('[id]').forEach((node) => (node.id += suffix));
  art.querySelectorAll('*').forEach((node) => {
    for (const attr of ['fill', 'stroke', 'clip-path']) {
      const value = node.getAttribute(attr);
      if (value?.startsWith('url(#')) node.setAttribute(attr, value.replace(/\)$/, `${suffix})`));
    }
  });
  return art;
}

function makeGhost(source: Element, rect: DOMRect, background: string, radius: number) {
  const ghost = document.createElement('div');
  ghost.className = 'morph-ghost';
  Object.assign(ghost.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    background,
    borderRadius: `${radius}px`,
  });
  const art = cloneArt(source);
  if (art) {
    art.removeAttribute('class');
    art.setAttribute('aria-hidden', 'true');
    ghost.appendChild(art);
  }
  document.body.appendChild(ghost);
  return ghost;
}

const isOnScreen = (r: DOMRect) => r.bottom > 0 && r.top < window.innerHeight && r.width > 0;

/**
 * Політ флакона з картки в шторку. Ціль вимірюється в кінцевому положенні шторки,
 * а під час польоту справжні зображення приховано — виходить один безперервний об'єкт.
 */
export function morphIn(id: string, target: HTMLElement, background: string) {
  const origin = morphOrigin;
  morphOrigin = null;
  if (!origin || origin.id !== id || !origin.el.isConnected || prefersReducedMotion()) return false;

  const from = origin.el.getBoundingClientRect();
  if (!isOnScreen(from)) return false;

  const sheet = target.closest<HTMLElement>('.sheet');
  if (!sheet) return false;
  // Вимірюємо ціль у кінцевому положенні: на мить вимикаємо анімацію появи шторки
  sheet.style.animation = 'none';
  const to = target.getBoundingClientRect();
  sheet.style.animation = '';

  const ghost = makeGhost(origin.el, from, background, 18);
  target.style.visibility = 'hidden';
  origin.el.style.visibility = 'hidden';
  const radiusTo = window.innerWidth >= 768 ? 18 : 0;

  const flight = ghost.animate(
    [
      { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '18px' },
      { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: `${radiusTo}px` },
    ],
    { duration: 640, easing: EASE.emph, fill: 'forwards' },
  );
  onDone(flight, 640, () => {
    target.style.visibility = '';
    origin.el.style.visibility = '';
    ghost.remove();
  });
  // Повертаємо картці її зображення трохи раніше — поки шторка ще накриває її
  window.setTimeout(() => (origin.el.style.visibility = ''), 420);
  return true;
}

/** Зворотний політ: флакон повертається у свою картку, якщо вона видна на екрані. */
export function morphOut(id: string, source: HTMLElement, background: string) {
  if (prefersReducedMotion()) return;
  const card = Array.from(document.querySelectorAll<HTMLElement>(`[data-morph-id="${CSS.escape(id)}"]`)).find((el) =>
    isOnScreen(el.getBoundingClientRect()),
  );
  if (!card) return;
  const from = source.getBoundingClientRect();
  const to = card.getBoundingClientRect();
  const ghost = makeGhost(source, from, background, window.innerWidth >= 768 ? 18 : 0);
  source.style.visibility = 'hidden';
  card.style.visibility = 'hidden';
  const flight = ghost.animate(
    [
      { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
      { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: '18px' },
    ],
    { duration: 520, easing: EASE.std, fill: 'forwards' },
  );
  onDone(flight, 520, () => {
    card.style.visibility = '';
    ghost.remove();
  });
}

/* ---------- Політ товару в кошик ---------- */

function bump(el: Element | null) {
  if (!el) return;
  el.classList.remove('is-bumping');
  void (el as HTMLElement).offsetWidth; // перезапуск анімації
  el.classList.add('is-bumping');
  window.setTimeout(() => el.classList.remove('is-bumping'), 700);
}

/**
 * Мініатюра флакона відривається від героя шторки й летить дугою в кошик:
 * зменшується, трохи обертається, а іконка кошика «ловить» її з пружинним поштовхом.
 */
export function flyToCart(source: HTMLElement | null) {
  const target = document.querySelector('[data-tab="cart"] .bottom-nav__icon');
  if (!target || !source || !source.querySelector('svg') || prefersReducedMotion()) {
    bump(target);
    return;
  }
  // Копія лягає точно на флакон (viewBox 200×240), тож здається, що злітає сам флакон
  const a = source.querySelector('svg')!.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const height = a.height;
  const width = (height * 200) / 240;
  const sx = a.left + a.width / 2;
  const sy = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - sx;
  const dy = b.top + b.height / 2 - sy;
  const lift = Math.min(160, Math.abs(dy) * 0.3 + 80);
  const endScale = 34 / height;
  const duration = 900;

  const outer = document.createElement('div');
  outer.className = 'fly';
  outer.style.left = `${sx}px`;
  outer.style.top = `${sy}px`;
  const inner = document.createElement('div');
  inner.className = 'fly__inner';
  inner.style.width = `${width}px`;
  inner.style.height = `${height}px`;
  const clone = cloneArt(source) as SVGElement;
  clone.querySelectorAll('.bottle__bg, .bottle__floor').forEach((n) => n.remove());
  clone.removeAttribute('class');
  inner.appendChild(clone);
  outer.appendChild(inner);
  document.body.appendChild(outer);

  // Горизонталь і вертикаль — з різними кривими: виходить природна дуга
  outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], {
    duration,
    easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
    fill: 'forwards',
  });
  const flight = inner.animate(
    [
      { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' },
      {
        transform: `translateY(${-lift}px) scale(${Math.max(endScale * 2.4, 0.42)}) rotate(-8deg)`,
        opacity: 1,
        offset: 0.42,
        easing: 'cubic-bezier(0.6, 0, 0.9, 0.5)',
      },
      { transform: `translateY(${dy}px) scale(${endScale}) rotate(14deg)`, opacity: 0.85 },
    ],
    { duration, fill: 'forwards' },
  );
  onDone(flight, duration, () => {
    outer.remove();
    bump(target);
  });
}

/* ---------- Видалення рядка списку ---------- */

/** Рядок відсувається з легким розмиттям, потім висота м'яко згортається. */
export async function collapseOut(el: HTMLElement, gap = 10) {
  if (prefersReducedMotion()) {
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).finished;
    return;
  }
  await el.animate(
    [
      { opacity: 1, transform: 'none', filter: 'blur(0)' },
      { opacity: 0, transform: 'translateX(-40px) scale(0.96)', filter: 'blur(3px)' },
    ],
    { duration: 260, easing: EASE.in, fill: 'forwards' },
  ).finished;
  const h = el.offsetHeight;
  el.style.overflow = 'hidden';
  await el.animate(
    [
      { height: `${h}px`, marginBottom: '0px' },
      { height: '0px', marginBottom: `${-gap}px`, paddingTop: '0px', paddingBottom: '0px', borderWidth: '0px' },
    ],
    { duration: 300, easing: EASE.std, fill: 'forwards' },
  ).finished;
}

/* ---------- Нахил картки за курсором (лише пристрої з мишею) ---------- */

/**
 * Картка ледь нахиляється в 3D за курсором, флакон зсувається у протилежний бік
 * (глибина), а по склу ковзає відблиск. На сенсорних екранах вимкнено.
 */
export function useTilt(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover()) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--tilt-x', `${(-py * 6).toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${(px * 7).toFixed(2)}deg`);
        el.style.setProperty('--glare-x', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${((py + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--depth-x', `${(-px * 8).toFixed(1)}px`);
        el.style.setProperty('--depth-y', `${(-py * 6).toFixed(1)}px`);
      });
      el.classList.add('is-tilting');
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.classList.remove('is-tilting');
      ['--tilt-x', '--tilt-y', '--depth-x', '--depth-y'].forEach((v) => el.style.removeProperty(v));
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
}

/* ---------- Чорнильна заливка чипів від точки дотику ---------- */

/** Запам'ятовує точку натискання на чипі — з неї розливається заливка. */
export function initInkOrigins() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      const chip = (e.target as HTMLElement).closest?.<HTMLElement>('.chip');
      if (!chip) return;
      const r = chip.getBoundingClientRect();
      chip.style.setProperty('--ink-x', `${e.clientX - r.left}px`);
      chip.style.setProperty('--ink-y', `${e.clientY - r.top}px`);
    },
    { passive: true, capture: true },
  );
}

/* ---------- Прокрутка: прив'язані до скролу ефекти ---------- */

/** Викликає callback не частіше за кадр під час прокручування сторінки. */
export function useScrollFrame(callback: () => void, deps: unknown[] = []) {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(callback);
    };
    run();
    window.addEventListener('scroll', run, { passive: true });
    window.addEventListener('resize', run);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', run);
      window.removeEventListener('resize', run);
    };
    // callback навмисно береться з рендера, у якому змінилися deps
  }, deps);
}
