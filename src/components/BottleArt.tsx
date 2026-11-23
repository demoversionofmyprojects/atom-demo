import { useId } from 'react';
import type { BottleArt as Art, Product } from '../data/types';

/**
 * Векторна ілюстрація флакона — тимчасова заміна фотографій товарів.
 * Щойно в Product з'явиться поле `image`, компонент покаже справжнє фото.
 */

const CAP_TONES: Record<Art['capTone'], [string, string]> = {
  gold: ['#E4CB98', '#9C7A45'],
  black: ['#4A4540', '#151312'],
  ivory: ['#FFFDF7', '#D9D0C0'],
  wood: ['#B88A5C', '#6E4B2E'],
  silver: ['#F2F2EF', '#A9A8A2'],
};

// Контури корпусу у viewBox 200×240; top — верхня точка корпусу (для горловини)
const BODIES: Record<Art['shape'], { d: string; top: number }> = {
  square: { d: 'M58 96h84a10 10 0 0 1 10 10v102a10 10 0 0 1-10 10H58a10 10 0 0 1-10-10V106a10 10 0 0 1 10-10z', top: 96 },
  round: { d: 'M100 102a58 58 0 1 1 0 116a58 58 0 1 1 0-116z', top: 102 },
  tall: { d: 'M80 74h40a9 9 0 0 1 9 9v126a9 9 0 0 1-9 9H80a9 9 0 0 1-9-9V83a9 9 0 0 1 9-9z', top: 74 },
  faceted: { d: 'M66 100h68l16 18v84l-16 16H66l-16-16v-84z', top: 100 },
  flask: {
    d: 'M84 96h32c22 6 36 22 36 48v62a12 12 0 0 1-12 12H60a12 12 0 0 1-12-12v-62c0-26 14-42 36-48z',
    top: 96,
  },
};

function Cap({ type, y, fill }: { type: Art['cap']; y: number; fill: string }) {
  switch (type) {
    case 'cube':
      return <rect x="76" y={y - 44} width="48" height="44" rx="5" fill={fill} />;
    case 'cylinder':
      return <rect x="84" y={y - 46} width="32" height="46" rx="6" fill={fill} />;
    case 'sphere':
      return <circle cx="100" cy={y - 22} r="23" fill={fill} />;
    case 'tower':
      return <rect x="89" y={y - 62} width="22" height="62" rx="4" fill={fill} />;
    case 'disc':
      return <rect x="68" y={y - 20} width="64" height="20" rx="4" fill={fill} />;
  }
}

function initials(brand: string) {
  return brand
    .replace('&', ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  product: Product;
  className?: string;
  /** «Живий» флакон для героя шторки: рідина ледь колишеться, піднімаються бульбашки. */
  live?: boolean;
}

export function BottleArt({ product, className, live = false }: Props) {
  const uid = useId().replace(/:/g, '');
  if (product.image) {
    return <img className={className} src={product.image} alt={`${product.brand} ${product.name}`} loading="lazy" />;
  }

  const { art } = product;
  const body = BODIES[art.shape];
  const [capLight, capDark] = CAP_TONES[art.capTone];
  const collarY = body.top - 10;
  const liquidTop = body.top + (218 - body.top) * 0.22;
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      className={`bottle${live ? ' bottle--live' : ''}${className ? ` ${className}` : ''}`}
      viewBox="0 0 200 240"
      role="img"
      aria-label={`Флакон ${product.brand} ${product.name}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={id('bg')} cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={art.backdrop} />
        </radialGradient>
        <linearGradient id={id('liquid')} x1="0" x2="1">
          <stop offset="0%" stopColor={art.liquid} stopOpacity="0.95" />
          <stop offset="55%" stopColor={art.liquid} stopOpacity="0.75" />
          <stop offset="100%" stopColor={art.liquid} />
        </linearGradient>
        <linearGradient id={id('cap')} x1="0" x2="1">
          <stop offset="0%" stopColor={capDark} />
          <stop offset="35%" stopColor={capLight} />
          <stop offset="100%" stopColor={capDark} />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" x2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <path d={body.d} />
        </clipPath>
      </defs>

      <rect className="bottle__bg" width="200" height="240" fill={`url(#${id('bg')})`} />
      <ellipse className="bottle__floor" cx="100" cy="222" rx="58" ry="6" fill="#2B2622" opacity="0.12" />

      <g className="bottle__body">
        {/* корпус: скло, рідина, відблиски */}
        <path d={body.d} fill="#FFFFFF" fillOpacity="0.55" />
        <g clipPath={`url(#${id('clip')})`}>
          <g className="bottle__liquid">
            <rect x="16" y={liquidTop} width="168" height="140" fill={`url(#${id('liquid')})`} />
            <rect x="16" y={liquidTop} width="168" height="1.2" fill="#FFFFFF" opacity="0.6" />
          </g>
          {live &&
            [0, 1, 2].map((b) => (
              <circle
                key={b}
                className="bottle__bubble"
                cx={86 + b * 13}
                cy={210}
                r={1.2 + (b % 2) * 0.6}
                fill="#FFFFFF"
                style={{ '--b': b } as React.CSSProperties}
              />
            ))}
          <rect x="40" y="206" width="120" height="14" fill="#000000" opacity="0.07" />
          <rect x="40" y={body.top} width="120" height="130" fill={`url(#${id('glass')})`} />
          {/* відблиск, що ковзає склом */}
          <rect className="bottle__glint" x="20" y={body.top - 20} width="16" height="160" fill="#FFFFFF" opacity="0.5" />
        </g>
        <path d={body.d} fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5" />
        <path d={body.d} fill="none" stroke="#2B2622" strokeOpacity="0.12" strokeWidth="0.8" />

        {/* етикетка */}
        <g transform={`translate(100 ${(body.top + 218) / 2 + 6})`}>
          <rect x="-24" y="-15" width="48" height="30" rx="2" fill="#FFFDF8" fillOpacity="0.92" />
          <rect x="-21" y="-12" width="42" height="24" rx="1" fill="none" stroke="#B08D57" strokeWidth="0.6" />
          <text
            y="4"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="12"
            letterSpacing="1.5"
            fill="#2B2622"
          >
            {initials(product.brand)}
          </text>
        </g>

        {/* горловина й кришка */}
        <rect x="88" y={collarY} width="24" height="11" rx="2" fill={`url(#${id('cap')})`} opacity="0.9" />
        <Cap type={art.cap} y={collarY + 1} fill={`url(#${id('cap')})`} />
      </g>
    </svg>
  );
}
