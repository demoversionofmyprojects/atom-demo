import { Fragment } from 'react';

/**
 * Текст, що з'являється по словах: кожне слово виїжджає з-під маски рядка.
 * Класичний прийом редакційних і люксових сайтів. `start` — номер першого слова
 * для неперервного каскаду, коли заголовок складається з кількох частин.
 */
export function SplitText({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="split-word">
            <span className="split-word__inner" style={{ '--w': start + i } as React.CSSProperties}>
              {word}
            </span>
          </span>
          {/* Пробіл — поза маскою, інакше він «з'їдається» всередині inline-block */}
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  );
}
