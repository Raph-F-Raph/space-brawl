import type { ReactNode } from 'react';

// Petites icônes dessinées pour le jeu : elles sont identiques sur Android, iPhone et ordinateur
// (les emoji changent d'aspect selon le téléphone).
const O = '#0b1030'; // contour sombre
const S = { stroke: O, strokeWidth: 1.8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const ICONS: Record<string, ReactNode> = {
  coin: (
    <>
      <circle cx="12" cy="12" r="9" fill="#ffc933" {...S} />
      <circle cx="12" cy="12" r="6" fill="#ffe27a" stroke="#d99a1e" strokeWidth="1.2" />
      <path d="M12 8v8M9.8 10c0-1.1 4.4-1.1 4.4 0s-4.4 1.2-4.4 2.2 4.4 1.1 4.4 0" fill="none" stroke="#b9770e" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l4 6-10 12L2 9z" fill="#35c8ff" {...S} />
      <path d="M2 9h20M9 3 7 9l5 12M15 3l2 6-5 12" fill="none" stroke="#e8fbff" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 3h12l-2 6H8z" fill="#8be3ff" opacity="0.8" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="#ffc933" {...S} />
      <path d="M7 5H3c0 4 2 6 4 6M17 5h4c0 4-2 6-4 6" fill="none" {...S} />
      <path d="M12 14v4M8 21h8l-1-3H9z" fill="#ffa21f" {...S} />
      <path d="M9.5 5.5v3" stroke="#fff3b0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2.5" fill="#ffc933" {...S} />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" {...S} />
      <circle cx="12" cy="15" r="1.6" fill={O} />
    </>
  ),
  wrench: (
    <>
      <path d="M15.5 3.5a5 5 0 0 0-4.6 6.9L3.5 17.8a2.1 2.1 0 0 0 3 3l7.4-7.4a5 5 0 0 0 6.6-4.7l-3 3-3-.7-.7-3z" fill="#c4cde0" {...S} />
    </>
  ),
  crown: (
    <>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ffc933" {...S} />
      <circle cx="3" cy="8" r="1.3" fill="#ff6b9d" stroke={O} strokeWidth="1.2" />
      <circle cx="12" cy="5" r="1.3" fill="#ff6b9d" stroke={O} strokeWidth="1.2" />
      <circle cx="21" cy="8" r="1.3" fill="#ff6b9d" stroke={O} strokeWidth="1.2" />
    </>
  ),
  boom: (
    <>
      <path d="M12 2l2.2 5.3 5.6-1.6-2.4 5.3 4.6 3.3-5.7.6.2 5.8-4.5-3.7-4.5 3.7.2-5.8-5.7-.6 4.6-3.3-2.4-5.3 5.6 1.6z" fill="#ff9f1c" {...S} />
      <path d="M12 7l1.3 3.2 3.3.4-2.5 2.2.8 3.3-2.9-1.8-2.9 1.8.8-3.3-2.5-2.2 3.3-.4z" fill="#ffe27a" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="2" fill="#ff5d73" {...S} />
      <rect x="2" y="6" width="20" height="4.5" rx="1.5" fill="#ff8fa0" {...S} />
      <path d="M12 6v15" stroke="#ffe27a" strokeWidth="3" />
      <path d="M12 6c-1-3-5-3.5-5-1.5S10 6 12 6zm0 0c1-3 5-3.5 5-1.5S14 6 12 6z" fill="#ffe27a" {...S} />
    </>
  ),
  chestB: (
    <>
      <path d="M3 11a9 7 0 0 1 18 0v2H3z" fill="#b5651d" {...S} />
      <rect x="3" y="12" width="18" height="9" rx="1.5" fill="#8a4b14" {...S} />
      <path d="M3 12h18" stroke={O} strokeWidth="1.8" />
      <rect x="10" y="11" width="4" height="5" rx="1" fill="#e0b25a" {...S} />
    </>
  ),
  chestS: (
    <>
      <path d="M3 11a9 7 0 0 1 18 0v2H3z" fill="#aab4c8" {...S} />
      <rect x="3" y="12" width="18" height="9" rx="1.5" fill="#7d889e" {...S} />
      <path d="M3 12h18" stroke={O} strokeWidth="1.8" />
      <rect x="10" y="11" width="4" height="5" rx="1" fill="#e8f0ff" {...S} />
      <path d="M7 6.5v5M17 6.5v5" stroke={O} strokeWidth="1.4" />
    </>
  ),
  chestG: (
    <>
      <path d="M3 11a9 7 0 0 1 18 0v2H3z" fill="#ffc933" {...S} />
      <rect x="3" y="12" width="18" height="9" rx="1.5" fill="#e69b12" {...S} />
      <path d="M3 12h18" stroke={O} strokeWidth="1.8" />
      <rect x="10" y="11" width="4" height="5" rx="1" fill="#fff3b0" {...S} />
      <path d="M7 6.5v5M17 6.5v5" stroke={O} strokeWidth="1.4" />
      <path d="M12 1.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" fill="#fff3b0" />
    </>
  ),
  cart: (
    <>
      <path d="M2 4h3l2.5 11h11l2-8H6.2" fill="#6fa8ff" {...S} />
      <circle cx="9" cy="19.5" r="1.8" fill="#ffc933" {...S} />
      <circle cx="17" cy="19.5" r="1.8" fill="#ffc933" {...S} />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#e63946" {...S} />
      <path d="M12 2v20c-4.5-2-8-6-8-11V5z" fill="#f4f4f8" />
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="none" {...S} />
    </>
  ),
  gear: (
    <>
      <path d="M10 2h4l.6 2.7 2.3 1 2.4-1.5 2.8 2.8-1.5 2.4 1 2.3L24 10v4l-2.4.6-1 2.3 1.5 2.4-2.8 2.8-2.4-1.5-2.3 1L14 24h-4l-.6-2.4-2.3-1-2.4 1.5-2.8-2.8 1.5-2.4-1-2.3L0 14v-4l2.7-.6 1-2.3-1.5-2.4 2.8-2.8 2.4 1.5 2.3-1z" transform="translate(0 0) scale(.92) translate(1 1)" fill="#b8c0d4" {...S} />
      <circle cx="12" cy="12" r="3.3" fill="#53607f" {...S} />
    </>
  ),
  ufo: (
    <>
      <path d="M7 11a5 5 0 0 1 10 0z" fill="#bfeaff" {...S} />
      <ellipse cx="12" cy="13" rx="10" ry="4.5" fill="#6fa8ff" {...S} />
      <circle cx="6.5" cy="13.3" r="1.1" fill="#ffe27a" />
      <circle cx="12" cy="14.5" r="1.1" fill="#ffe27a" />
      <circle cx="17.5" cy="13.3" r="1.1" fill="#ffe27a" />
    </>
  ),
  pilot: (
    <>
      <circle cx="12" cy="11" r="8" fill="#e6efff" {...S} />
      <rect x="6.5" y="7.5" width="11" height="7" rx="3.5" fill="#2b3a67" {...S} />
      <circle cx="10" cy="11" r="1" fill="#8be3ff" />
      <circle cx="14" cy="11" r="1" fill="#8be3ff" />
      <path d="M7 19.5h10" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2c4 2.5 5.5 7 4.5 12h-9C6.5 9 8 4.5 12 2z" fill="#f4f4f8" {...S} />
      <circle cx="12" cy="9" r="2" fill="#6fa8ff" {...S} />
      <path d="M7.5 14L4 17l1-4.5zM16.5 14l3.5 3-1-4.5z" fill="#e63946" {...S} />
      <path d="M9.5 14h5l-1 3.5h-3z" fill="#ffc933" {...S} />
      <path d="M12 18l-1.2 4h2.4z" fill="#ff9f1c" {...S} />
    </>
  ),
  monster: (
    <>
      <circle cx="12" cy="13" r="8.5" fill="#e63946" {...S} />
      <path d="M5 8L3 2l5 3.5zM19 8l2-6-5 3.5z" fill="#ffc933" {...S} />
      <circle cx="9" cy="12" r="1.7" fill="#fff" stroke={O} strokeWidth="1.2" />
      <circle cx="15" cy="12" r="1.7" fill="#fff" stroke={O} strokeWidth="1.2" />
      <circle cx="9" cy="12.3" r="0.7" fill={O} />
      <circle cx="15" cy="12.3" r="0.7" fill={O} />
      <path d="M8 17c2-1.5 6-1.5 8 0" fill="none" {...S} />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" fill="#c4cde0" {...S} />
      <rect x="8" y="5" width="8" height="12" rx="1" fill="#2b3a67" />
      <circle cx="12" cy="19.5" r="0.9" fill={O} />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#ffe27a" {...S} />
    </>
  ),
  users: (
    <>
      <circle cx="8.5" cy="8" r="3.3" fill="#ffd0a8" {...S} />
      <circle cx="16.5" cy="9" r="2.8" fill="#ffb27a" {...S} />
      <path d="M2.5 20c0-4 2.7-6 6-6s6 2 6 6zM14.5 14.3c3-.5 7 1 7 5.7h-5" fill="#6fa8ff" {...S} />
    </>
  ),
  galaxy: (
    <>
      <circle cx="12" cy="12" r="9" fill="#2b1b5d" {...S} />
      <path d="M12 12c0-5 6-5 7 0s-5 7-9 4-1-9 4-8" fill="none" stroke="#ff7de9" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill="#ffe27a" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3C6.5 3 2.5 7 2.5 12s4 9 8.5 9c2 0 2.5-1.5 1.5-3s0-3 2-3h3c2.5 0 3.5-1.5 3.5-3.5C21 6.5 17 3 12 3z" fill="#ffd9a0" {...S} />
      <circle cx="7.5" cy="11" r="1.5" fill="#e63946" />
      <circle cx="10.5" cy="7" r="1.5" fill="#ffc933" />
      <circle cx="15.5" cy="7.5" r="1.5" fill="#5bd75b" />
      <circle cx="18" cy="11.5" r="1.5" fill="#6fa8ff" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6.5" fill="#bfeaff" {...S} />
      <path d="M15 15l6 6" stroke={O} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15 15l6 6" stroke="#ffc933" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  install: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" fill="#c4cde0" {...S} />
      <path d="M12 6v8m-3-3l3 3 3-3" fill="none" stroke="#2b3a67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="12" width="5" height="9" rx="1" fill="#5bd75b" {...S} />
      <rect x="9.5" y="4" width="5" height="17" rx="1" fill="#6fa8ff" {...S} />
      <rect x="16" y="9" width="5" height="12" rx="1" fill="#ffc933" {...S} />
    </>
  ),
  medal1: (
    <>
      <path d="M7 2l3 7M17 2l-3 7" stroke="#e63946" strokeWidth="3" />
      <circle cx="12" cy="15" r="7" fill="#ffc933" {...S} />
      <path d="M12 11v8M10.2 12.2L12 11" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  medal2: (
    <>
      <path d="M7 2l3 7M17 2l-3 7" stroke="#e63946" strokeWidth="3" />
      <circle cx="12" cy="15" r="7" fill="#cfd6e6" {...S} />
      <path d="M9.5 12.5c0-3 5-3 5 0 0 2-5 4-5 6h5" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  medal3: (
    <>
      <path d="M7 2l3 7M17 2l-3 7" stroke="#e63946" strokeWidth="3" />
      <circle cx="12" cy="15" r="7" fill="#e0904f" {...S} />
      <path d="M9.5 12c3-1.5 5 1 2 2.5 3 .5 2 4.5-2 4" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

/** Texte -> icônes : les petits emoji du jeu sont remplacés par nos dessins. */
const MAP: Record<string, string> = {
  '🪙': 'coin', '💎': 'gem', '🏆': 'trophy', '🔒': 'lock', '🔧': 'wrench', '👑': 'crown', '💥': 'boom', '🎁': 'gift',
  '📦': 'chestB', '🧰': 'chestS', '🛒': 'cart', '🛡️': 'shield', '🛡': 'shield', '⚙️': 'gear', '⚙': 'gear', '🛸': 'ufo',
  '🧑‍🚀': 'pilot', '🧑': 'pilot', '🚀': 'rocket', '👹': 'monster', '📱': 'phone', '✨': 'sparkle', '👥': 'users', '🌌': 'galaxy',
  '🎨': 'palette', '🔍': 'search', '📲': 'install', '📊': 'chart', '🥇': 'medal1', '🥈': 'medal2', '🥉': 'medal3',
};

export function Icon({ n, size }: { n: string; size?: number | string }) {
  const body = ICONS[n];
  if (!body) return null;
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      width={size ?? '1.15em'}
      height={size ?? '1.15em'}
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}

const RE = new RegExp(`(${Object.keys(MAP).sort((a, b) => b.length - a.length).join('|')})`, 'g');

/** Remplace les emoji d'un texte par nos icônes (les autres valeurs passent telles quelles). */
export function rich(v: unknown): ReactNode {
  if (typeof v !== 'string') return v as ReactNode;
  const parts = v.split(RE);
  if (parts.length === 1) return v;
  return parts.map((p, i) => (MAP[p] ? <Icon key={i} n={MAP[p]} /> : p));
}
