const DIGITS = '0123456789';

/**
 * Значення, у якого цифри «прокручуються» до нового числа, як у механічному лічильнику.
 * Кожен розряд має власну затримку — праві змінюються першими.
 */
export function RollingNumber({ value, className = '' }: { value: string; className?: string }) {
  const chars = Array.from(value);
  return (
    <span className={`rolling ${className}`} aria-label={value} role="text">
      {chars.map((ch, i) => {
        const digit = DIGITS.indexOf(ch);
        // Ключ від позиції з кінця: розряди не «переїжджають», коли число стає довшим
        const key = chars.length - i;
        if (digit < 0) {
          return (
            <span key={`c${key}`} className="rolling__char" aria-hidden>
              {ch === ' ' || ch === ' ' || ch === ' ' ? ' ' : ch}
            </span>
          );
        }
        return (
          <span key={`d${key}`} className="rolling__digit" aria-hidden>
            <span
              className="rolling__strip"
              style={{ transform: `translateY(${-digit * 10}%)`, transitionDelay: `${(chars.length - i) * 28}ms` }}
            >
              {DIGITS.split('').map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
