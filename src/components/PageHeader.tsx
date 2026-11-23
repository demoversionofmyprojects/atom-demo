import type { ReactNode } from 'react';

/** Компактна шапка розділу з емблемою бренду. */
export function PageHeader({ title, subtitle, aside }: { title: string; subtitle?: string; aside?: ReactNode }) {
  return (
    <header className="page-header">
      <img className="page-header__emblem" src="./emblem.png" alt="Atom Parfums" />
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {aside}
    </header>
  );
}
