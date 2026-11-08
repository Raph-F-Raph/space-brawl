// Étoiles par niveau (1 à 3 selon la vie restante), gardées sur l'appareil
const KEY = 'space-brawl-stars';

function load(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function starsFor(hpFrac: number): number {
  return hpFrac >= 0.7 ? 3 : hpFrac >= 0.35 ? 2 : 1;
}

export function getStars(chapter: number, level: number): number {
  return load()[`${chapter}-${level}`] ?? 0;
}

export function saveStars(chapter: number, level: number, n: number) {
  const all = load();
  const k = `${chapter}-${level}`;
  if ((all[k] ?? 0) >= n) return;
  all[k] = n;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignoré */
  }
}
