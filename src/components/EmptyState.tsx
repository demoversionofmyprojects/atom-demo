import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, text, action }: Props) {
  return (
    <div className="empty">
      <div className="empty__icon">
        {/* Золоте кільце, що прорисовується навколо іконки */}
        <svg className="empty__ring" viewBox="0 0 76 76" aria-hidden>
          <circle cx="38" cy="38" r="36" />
        </svg>
        {icon}
      </div>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__text">{text}</p>
      {action && (
        <button className="btn btn--outline" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
