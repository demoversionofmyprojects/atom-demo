import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';

export function Toast() {
  const { toast } = useApp();
  // Тримаємо останнє сповіщення, поки воно граціозно зникає
  const [shown, setShown] = useState(toast);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (toast) {
      setShown(toast);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const t = window.setTimeout(() => setShown(null), 220);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!shown) return null;
  return (
    <div className={`toast${leaving ? ' is-leaving' : ''}`} key={shown.id} role="status">
      <span>{shown.text}</span>
      {shown.action && (
        <button className="toast__action" onClick={shown.action.onClick}>
          {shown.action.label}
        </button>
      )}
      {/* Тонка смужка показує, скільки лишилося до автозакриття */}
      <span className="toast__timer" aria-hidden />
    </div>
  );
}
