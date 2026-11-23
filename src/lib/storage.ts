/**
 * Локальне збереження стану між сесіями. Доступ до localStorage може бути
 * заблокований (приватний режим, деякі вебв'ю), тому всі виклики безпечні.
 * У повній версії можна замінити на Telegram CloudStorage або власне API.
 */
const PREFIX = 'atom-parfums:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ігноруємо — демо працює і без збереження */
  }
}
