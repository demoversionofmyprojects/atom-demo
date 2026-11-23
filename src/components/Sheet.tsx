import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { bindBackButton } from '../lib/telegram';
import { CloseIcon } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const EXIT_MS = 340;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.55; // px/мс

let openSheets = 0;

/** Екран під шторкою відходить углиб — як картки в стосі. */
function setStacked(delta: 1 | -1) {
  openSheets = Math.max(0, openSheets + delta);
  const root = document.documentElement;
  if (delta > 0) root.style.setProperty('--stack-origin', `${window.scrollY + window.innerHeight * 0.45}px`);
  document.body.classList.toggle('sheet-open', openSheets > 0);
}

/**
 * Нижня шторка на мобільних і центроване вікно на великих екранах.
 * Рендериться в body (портал), закривається з анімацією, на мобільних — ще й свайпом униз.
 */
export function Sheet({ open, onClose, title, children, footer, className = '' }: Props) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startT: number; dy: number } | null>(null);
  const dragged = useRef(false);

  // Монтування / анімоване розмонтування
  useEffect(() => {
    if (open) {
      dragged.current = false;
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    setStacked(1);
    const unbind = bindBackButton(onClose);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      setStacked(-1);
      unbind();
    };
  }, [open, onClose]);

  const canDrag = () => window.matchMedia('(max-width: 767px)').matches;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canDrag() || (e.target as HTMLElement).closest('button')) return;
    drag.current = { startY: e.clientY, startT: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    sheetRef.current?.style.setProperty('transition', 'none');
    document.body.classList.add('sheet-dragging');
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d || !sheet) return;
    const raw = e.clientY - d.startY;
    // Вниз — слідом за пальцем, угору — з «гумовим» опором
    d.dy = raw > 0 ? raw : -Math.sqrt(-raw) * 2.2;
    sheet.style.transform = `translateY(${d.dy}px)`;
    const progress = Math.min(1, Math.max(0, d.dy) / 420);
    if (backdropRef.current) backdropRef.current.style.opacity = String(1 - progress * 0.8);
    document.documentElement.style.setProperty('--stack-progress', String(1 - progress));
  };

  const onPointerUp = () => {
    const d = drag.current;
    const sheet = sheetRef.current;
    drag.current = null;
    document.body.classList.remove('sheet-dragging');
    if (!d || !sheet) return;
    const velocity = d.dy / Math.max(1, performance.now() - d.startT);
    document.documentElement.style.removeProperty('--stack-progress');
    if (d.dy > DISMISS_DISTANCE || (d.dy > 24 && velocity > DISMISS_VELOCITY)) {
      dragged.current = true;
      sheet.style.transition = `transform ${EXIT_MS}ms cubic-bezier(0.3, 0, 0.8, 0.15)`;
      sheet.style.transform = 'translateY(100%)';
      onClose();
      return;
    }
    // Повертаємо на місце з м'якою пружністю
    sheet.style.transition = 'transform 520ms cubic-bezier(0.34, 1.3, 0.64, 1)';
    sheet.style.transform = '';
    if (backdropRef.current) backdropRef.current.style.opacity = '';
  };

  if (!mounted) return null;

  return createPortal(
    <div className={`sheet-root${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" ref={backdropRef} onClick={onClose} />
      <div className={`sheet ${className}`} ref={sheetRef} data-dragged={dragged.current || undefined}>
        <div
          className="sheet__drag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet__grip" aria-hidden />
          <div className="sheet__head">
            {title && <h2 className="sheet__title">{title}</h2>}
            <button className="icon-btn sheet__close" onClick={onClose} aria-label="Закрити">
              <CloseIcon size={20} />
            </button>
          </div>
        </div>
        <div className="sheet__content">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
