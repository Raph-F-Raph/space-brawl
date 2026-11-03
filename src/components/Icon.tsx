import type { ReactNode } from 'react';

// Petites icônes dessinées pour le jeu : elles sont identiques sur Android, iPhone et ordinateur
// (les emoji changent d'aspect selon le téléphone).
const O = '#0b1030'; // contour sombre
const S = { stroke: O, strokeWidth: 1.8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const ICONS: Record<string, ReactNode> = {
  coin: (
    <>
      <circle cx="12" cy="12.6" r="9.4" fill="#a05a00" />
      <circle cx="12" cy="12" r="9.4" fill="url(#gGold)" {...S} />
      <circle cx="12" cy="12" r="6.9" fill="url(#gGoldDark)" stroke="#a05a00" strokeWidth="1" />
      <path d="M12 6.6l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z" fill="#fff3b0" stroke="#b9770e" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M5.3 8.5A8 8 0 0 1 10 4.3" fill="none" stroke="#fffdf0" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3.5h12L22.5 9 12 21.5 1.5 9z" fill="url(#gBlue)" {...S} />
      <path d="M6 3.5L9 9h6l3-5.5z" fill="#c9f6ff" opacity="0.95" />
      <path d="M1.5 9h21M9 9l3 12.5M15 9l-3 12.5M6 3.5L9 9M18 3.5L15 9" fill="none" stroke="#0b6fb8" strokeWidth="1" strokeLinejoin="round" opacity="0.8" />
      <path d="M2.5 9.5L12 20.5 8.5 9.5z" fill="#1a8fe0" opacity="0.5" />
      <path d="M4.2 8.3L7 4.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 2l.7 1.8 1.8.7-1.8.7L20 7l-.7-1.8-1.8-.7 1.8-.7z" fill="#fff" stroke="none" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 21.5h9l-.8-3.4h-7.4z" fill="url(#gGoldDark)" {...S} />
      <rect x="6" y="20.2" width="12" height="3" rx="1.2" fill="#5b3a12" {...S} />
      <path d="M11 14.5h2v4h-2z" fill="url(#gGoldDark)" {...S} />
      <path d="M6.8 3h10.4v6.4a5.2 5.2 0 0 1-10.4 0z" fill="url(#gGold)" {...S} />
      <path d="M6.8 5H2.8c0 4.2 1.8 6.6 4.6 7M17.2 5h4c0 4.2-1.8 6.6-4.6 7" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" />
      <path d="M6.8 5H2.8c0 4.2 1.8 6.6 4.6 7M17.2 5h4c0 4.2-1.8 6.6-4.6 7" fill="none" stroke="#ffc933" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 5l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" fill="#fff3b0" stroke="#b9770e" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="M8.6 4.8v4.4" stroke="#fffdf0" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <path d="M7.5 10.5V7.4a4.5 4.5 0 0 1 9 0v3.1" fill="none" stroke={O} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M7.5 10.5V7.4a4.5 4.5 0 0 1 9 0v3.1" fill="none" stroke="#dfe6f5" strokeWidth="2" strokeLinecap="round" />
      <rect x="4.5" y="10" width="15" height="11.5" rx="3" fill="url(#gGold)" {...S} />
      <path d="M6.5 12.3h11" stroke="#fff7c9" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <circle cx="12" cy="15.2" r="1.9" fill={O} />
      <path d="M12 16v2.6" stroke={O} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  wrench: (
    <>
      <path d="M16 2.8a5.3 5.3 0 0 0-5 7.1L3.6 17.3a2.3 2.3 0 0 0 3.2 3.2l7.4-7.4a5.3 5.3 0 0 0 7-5l-3.3 3.2-2.9-.8-.8-2.9z" fill="url(#gSilver)" {...S} />
      <circle cx="5.2" cy="18.9" r="0.9" fill="#53607f" />
      <path d="M9 14.2l2.2-2.2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </>
  ),
  crown: (
    <>
      <path d="M2.5 8.5l4.6 4.3L12 4.5l4.9 8.3 4.6-4.3-1.9 11.5H4.4z" fill="url(#gGold)" {...S} />
      <path d="M4.6 17.2h14.8" stroke="#b9770e" strokeWidth="1.3" />
      <circle cx="2.5" cy="8" r="1.7" fill="#ff5d8f" stroke={O} strokeWidth="1.2" />
      <circle cx="12" cy="4" r="1.7" fill="#6fd6ff" stroke={O} strokeWidth="1.2" />
      <circle cx="21.5" cy="8" r="1.7" fill="#ff5d8f" stroke={O} strokeWidth="1.2" />
      <path d="M12 12.2l1.4 1.7-1.4 1.8-1.4-1.8z" fill="#e63946" stroke={O} strokeWidth="1" strokeLinejoin="round" />
      <path d="M6.2 11.5l1.4 4M17.8 11.5l-1.4 4" stroke="#fff3b0" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  boom: (
    <>
      <path d="M12 1.5l2.4 5.6 5.9-1.9-2.7 5.5 4.9 3.5-6 .6.3 6.1-4.8-3.8-4.8 3.8.3-6.1-6-.6 4.9-3.5-2.7-5.5 5.9 1.9z" fill="url(#gOrange)" {...S} />
      <path d="M12 6.2l1.5 3.4 3.6.5-2.7 2.5.7 3.6-3.1-1.9-3.1 1.9.7-3.6-2.7-2.5 3.6-.5z" fill="#ffe27a" />
      <path d="M12 9.2l.8 1.8 1.9.3-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.3z" fill="#fffdf0" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="10" width="18" height="12" rx="2" fill="url(#gRed)" {...S} />
      <rect x="2" y="6.3" width="20" height="5" rx="1.6" fill="#ff8a98" {...S} />
      <rect x="10.2" y="6.3" width="3.6" height="15.7" fill="url(#gGold)" stroke={O} strokeWidth="1.2" />
      <path d="M12 6.3C10.6 2.5 5.5 2.8 6.5 5.2 7.2 6.6 10 6.3 12 6.3zM12 6.3c1.4-3.8 6.5-3.5 5.5-1.1-.7 1.4-3.5 1.1-5.5 1.1z" fill="url(#gGold)" {...S} />
      <circle cx="12" cy="6.2" r="1.5" fill="#ffc933" stroke={O} strokeWidth="1.2" />
      <path d="M4.5 13.5v6" stroke="#ffb0b8" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  chestB: (
    <>
      <path d="M2.8 11.4a9.2 7.4 0 0 1 18.4 0V13H2.8z" fill="url(#gWood)" {...S} />
      <rect x="2.8" y="12.4" width="18.4" height="9.4" rx="1.6" fill="url(#gWood)" {...S} />
      <path d="M3 12.6h18" stroke={O} strokeWidth="1.8" />
      <path d="M7.2 5.4v7M16.8 5.4v7M7.2 13.5v8M16.8 13.5v8" stroke="#6e3a10" strokeWidth="2.2" />
      <path d="M6 7.6v4M18 7.6v4" stroke="#e6a860" strokeWidth="0.9" opacity="0.8" />
      <rect x="9.6" y="11" width="4.8" height="6" rx="1.2" fill="url(#gGold)" {...S} />
      <circle cx="12" cy="13.6" r="1" fill={O} />
      <path d="M12 14v1.8" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  chestS: (
    <>
      <path d="M2.8 11.4a9.2 7.4 0 0 1 18.4 0V13H2.8z" fill="url(#gSilver)" {...S} />
      <rect x="2.8" y="12.4" width="18.4" height="9.4" rx="1.6" fill="url(#gSilverDark)" {...S} />
      <path d="M3 12.6h18" stroke={O} strokeWidth="1.8" />
      <path d="M7.2 5.4v7M16.8 5.4v7M7.2 13.5v8M16.8 13.5v8" stroke="#53607f" strokeWidth="2.2" />
      <circle cx="5" cy="15" r="0.7" fill="#fff" />
      <circle cx="19" cy="15" r="0.7" fill="#fff" />
      <circle cx="5" cy="19.5" r="0.7" fill="#fff" />
      <circle cx="19" cy="19.5" r="0.7" fill="#fff" />
      <rect x="9.6" y="11" width="4.8" height="6" rx="1.2" fill="url(#gBlue)" {...S} />
      <circle cx="12" cy="13.6" r="1" fill={O} />
      <path d="M12 14v1.8" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 7.2a8 6 0 0 1 3-2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" fill="none" />
    </>
  ),
  chestG: (
    <>
      <path d="M7 4.5l1 2.2 2.4.3-1.8 1.6.5 2.4L7 10.3l-2.1 1.7.5-2.4-1.8-1.6 2.4-.3z" fill="#fff3b0" opacity="0" />
      <path d="M2.8 11.4a9.2 7.4 0 0 1 18.4 0V13H2.8z" fill="url(#gGold)" {...S} />
      <rect x="2.8" y="12.4" width="18.4" height="9.4" rx="1.6" fill="url(#gGoldDark)" {...S} />
      <path d="M3 12.6h18" stroke={O} strokeWidth="1.8" />
      <path d="M7.2 5.4v7M16.8 5.4v7M7.2 13.5v8M16.8 13.5v8" stroke="#b9770e" strokeWidth="2.2" />
      <circle cx="5" cy="15" r="0.8" fill="#fff3b0" />
      <circle cx="19" cy="15" r="0.8" fill="#fff3b0" />
      <circle cx="5" cy="19.5" r="0.8" fill="#fff3b0" />
      <circle cx="19" cy="19.5" r="0.8" fill="#fff3b0" />
      <rect x="9.4" y="10.8" width="5.2" height="6.4" rx="1.3" fill="#ff5d8f" {...S} />
      <circle cx="12" cy="13.6" r="1" fill={O} />
      <path d="M12 14v1.8" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 0.6l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.2-2 1.2.4-2.3-1.7-1.6 2.3-.3z" fill="#fff7c9" stroke="#e08a00" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="M4 3l.5 1.2 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2zM20 3l.5 1.2 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2z" fill="#fff" stroke="none" />
    </>
  ),
  cart: (
    <>
      <path d="M1.8 3.5h3.3l2.6 11.6h11.2l2.2-8.6H6" fill="url(#gBlue)" {...S} />
      <path d="M8 9h12M8.5 12h10" stroke="#e8fbff" strokeWidth="1" opacity="0.8" />
      <circle cx="9.2" cy="19.6" r="2" fill="url(#gGold)" {...S} />
      <circle cx="17.2" cy="19.6" r="2" fill="url(#gGold)" {...S} />
    </>
  ),
  shield: (
    <>
      <path d="M12 1.8l8.2 3v6.4c0 5.2-3.5 9.2-8.2 11.2-4.7-2-8.2-6-8.2-11.2V4.8z" fill="url(#gRed)" {...S} />
      <path d="M12 1.8v20.6c-4.7-2-8.2-6-8.2-11.2V4.8z" fill="#f4f6fc" />
      <path d="M12 1.8l8.2 3v6.4c0 5.2-3.5 9.2-8.2 11.2-4.7-2-8.2-6-8.2-11.2V4.8z" fill="none" {...S} />
      <path d="M12 8l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="#ffc933" stroke={O} strokeWidth="0.9" strokeLinejoin="round" />
    </>
  ),
  gear: (
    <>
      <path d="M10 1.8h4l.6 2.9 2.4 1 2.5-1.6 2.8 2.8-1.6 2.5 1 2.4 2.9.6v4l-2.9.6-1 2.4 1.6 2.5-2.8 2.8-2.5-1.6-2.4 1-.6 2.9h-4l-.6-2.9-2.4-1-2.5 1.6-2.8-2.8 1.6-2.5-1-2.4-2.9-.6v-4l2.9-.6 1-2.4-1.6-2.5 2.8-2.8 2.5 1.6 2.4-1z" transform="translate(1.1 1.1) scale(.9)" fill="url(#gSilver)" {...S} />
      <circle cx="12" cy="12" r="4" fill="url(#gSilverDark)" {...S} />
      <circle cx="12" cy="12" r="1.5" fill={O} />
      <path d="M6 6.5a8 8 0 0 1 3-2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </>
  ),
  ufo: (
    <>
      <path d="M6.5 11.2a5.5 5.5 0 0 1 11 0z" fill="#d9f4ff" {...S} />
      <path d="M8.5 9.4a3.5 3.5 0 0 1 2-1.7" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <ellipse cx="12" cy="13.4" rx="10.4" ry="4.6" fill="url(#gBlue)" {...S} />
      <path d="M2.4 13.8c3 2.8 16.2 2.8 19.2 0" fill="none" stroke="#0b6fb8" strokeWidth="1" opacity="0.7" />
      <circle cx="6.3" cy="13.5" r="1.2" fill="#ffe27a" stroke={O} strokeWidth="0.8" />
      <circle cx="12" cy="15.1" r="1.2" fill="#ffe27a" stroke={O} strokeWidth="0.8" />
      <circle cx="17.7" cy="13.5" r="1.2" fill="#ffe27a" stroke={O} strokeWidth="0.8" />
    </>
  ),
  pilot: (
    <>
      <circle cx="12" cy="11.5" r="8.6" fill="url(#gSilver)" {...S} />
      <rect x="5.8" y="7" width="12.4" height="8.4" rx="4.2" fill="#1f2b55" {...S} />
      <path d="M7.5 9a4 3 0 0 1 3-1.3" stroke="#6fd6ff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="9.8" cy="11.4" r="1.1" fill="#8be3ff" />
      <circle cx="14.2" cy="11.4" r="1.1" fill="#8be3ff" />
      <path d="M8 21.4c1-2.2 7-2.2 8 0" fill="url(#gRed)" {...S} />
      <path d="M3.4 10.5h1.6M19 10.5h1.6" stroke={O} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 1.6c4.4 2.6 6 7.6 4.8 13.2H7.2C6 9.2 7.6 4.2 12 1.6z" fill="url(#gSilver)" {...S} />
      <path d="M12 1.6c-2 1.6-3 4-3.2 6.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="9" r="2.4" fill="url(#gBlue)" {...S} />
      <path d="M7.4 11.6L3.6 16l1.2-5.2zM16.6 11.6l3.8 4.4-1.2-5.2z" fill="url(#gRed)" {...S} />
      <path d="M9 14.8h6l-1 3.6h-4z" fill="url(#gGoldDark)" {...S} />
      <path d="M12 18.4l-1.6 4h3.2z" fill="url(#gOrange)" {...S} />
    </>
  ),
  monster: (
    <>
      <path d="M4.2 8.2L2.4 1.8l5.6 3.4zM19.8 8.2l1.8-6.4-5.6 3.4z" fill="url(#gGold)" {...S} />
      <circle cx="12" cy="13" r="9" fill="url(#gRed)" {...S} />
      <path d="M4.5 10.5c1-3 4-4.6 7.5-4.6" stroke="#ffb0b0" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M6.2 9.6l4 2M17.8 9.6l-4 2" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="12.8" r="1.9" fill="#fff" stroke={O} strokeWidth="1.2" />
      <circle cx="15" cy="12.8" r="1.9" fill="#fff" stroke={O} strokeWidth="1.2" />
      <circle cx="9.3" cy="13.1" r="0.8" fill={O} />
      <circle cx="14.7" cy="13.1" r="0.8" fill={O} />
      <path d="M7.5 17.2c2.5-1.8 6.5-1.8 9 0l-1 2.2-1.4-1.2-1.1 1.4-1.1-1.4-1.4 1.2z" fill="#fff" {...S} />
    </>
  ),
  phone: (
    <>
      <rect x="5.5" y="1.8" width="13" height="20.4" rx="3" fill="url(#gSilver)" {...S} />
      <rect x="7.4" y="5" width="9.2" height="12.8" rx="1.4" fill="#1f2b55" />
      <path d="M8.2 6l2.4 0M8.2 7.6l5 0" stroke="#6fd6ff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <circle cx="12" cy="20" r="0.9" fill={O} />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z" fill="url(#gGold)" {...S} />
      <path d="M12 6l1.2 4.8L18 12l-4.8 1.2L12 18l-1.2-4.8L6 12l4.8-1.2z" fill="#fffdf0" />
    </>
  ),
  users: (
    <>
      <circle cx="8.5" cy="7.8" r="3.6" fill="#ffd0a8" {...S} />
      <circle cx="17" cy="9" r="3" fill="#ffb27a" {...S} />
      <path d="M1.8 21c0-4.4 3-6.6 6.7-6.6s6.7 2.2 6.7 6.6zM14.6 14.6c3.2-.4 7.6 1.2 7.6 6.4h-5.4" fill="url(#gBlue)" {...S} />
    </>
  ),
  galaxy: (
    <>
      <circle cx="12" cy="12" r="9.6" fill="#22104d" {...S} />
      <path d="M12 12c0-5.4 6.4-5.4 7.4 0S14 19.4 9.6 16.2 8.4 7.4 13.6 8.4" fill="none" stroke="#ff7de9" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12c0 3.6-4.4 3.6-5 0s3.4-5 6.6-3" fill="none" stroke="#6fd6ff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.8" fill="#ffe27a" />
      <circle cx="6.5" cy="6.5" r="0.7" fill="#fff" />
      <circle cx="18" cy="17" r="0.7" fill="#fff" />
    </>
  ),
  palette: (
    <>
      <path d="M12 2.5C6.4 2.5 2 6.8 2 12.2s4.3 9.3 9 9.3c2.2 0 2.8-1.7 1.7-3.2s-.1-3.2 2.1-3.2h3c2.6 0 4.2-1.6 4.2-3.8C22 6.2 17.8 2.5 12 2.5z" fill="#ffe3b3" {...S} />
      <circle cx="7" cy="11.4" r="1.7" fill="#e63946" stroke={O} strokeWidth="0.9" />
      <circle cx="10.2" cy="6.8" r="1.7" fill="#ffc933" stroke={O} strokeWidth="0.9" />
      <circle cx="15.8" cy="7.2" r="1.7" fill="#5bd75b" stroke={O} strokeWidth="0.9" />
      <circle cx="18.2" cy="12" r="1.7" fill="#6fa8ff" stroke={O} strokeWidth="0.9" />
    </>
  ),
  search: (
    <>
      <path d="M15.2 15.2l6.2 6.2" stroke={O} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M15.2 15.2l6.2 6.2" stroke="url(#gGold)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="10" r="7" fill="#d6f4ff" {...S} />
      <path d="M6.2 8.6a4.4 4.4 0 0 1 3-2.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  install: (
    <>
      <rect x="5.5" y="1.8" width="13" height="20.4" rx="3" fill="url(#gSilver)" {...S} />
      <rect x="7.4" y="5" width="9.2" height="12.8" rx="1.4" fill="#1f2b55" />
      <path d="M12 6.4v6.2m-3-2.8l3 3 3-3" fill="none" stroke="#ffc933" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="20" r="0.9" fill={O} />
    </>
  ),
  chart: (
    <>
      <rect x="2.6" y="12" width="5.4" height="9.4" rx="1.2" fill="url(#gGreen)" {...S} />
      <rect x="9.3" y="3.4" width="5.4" height="18" rx="1.2" fill="url(#gBlue)" {...S} />
      <rect x="16" y="8.6" width="5.4" height="12.8" rx="1.2" fill="url(#gGold)" {...S} />
    </>
  ),
  medal1: (
    <>
      <path d="M6.6 1.8L10 9.6h4l3.4-7.8z" fill="url(#gRed)" {...S} />
      <circle cx="12" cy="15" r="7.4" fill="url(#gGold)" {...S} />
      <circle cx="12" cy="15" r="5.2" fill="none" stroke="#b9770e" strokeWidth="1" />
      <path d="M10.4 12.4l2-1.4v8M10.4 19h4" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  medal2: (
    <>
      <path d="M6.6 1.8L10 9.6h4l3.4-7.8z" fill="url(#gBlue)" {...S} />
      <circle cx="12" cy="15" r="7.4" fill="url(#gSilver)" {...S} />
      <circle cx="12" cy="15" r="5.2" fill="none" stroke="#7d889e" strokeWidth="1" />
      <path d="M9.6 12.6c.4-2.4 4.8-2.4 4.8.2 0 2.4-4.6 4-4.8 6.2h5" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  medal3: (
    <>
      <path d="M6.6 1.8L10 9.6h4l3.4-7.8z" fill="url(#gGreen)" {...S} />
      <circle cx="12" cy="15" r="7.4" fill="url(#gWood)" {...S} />
      <circle cx="12" cy="15" r="5.2" fill="none" stroke="#6e3a10" strokeWidth="1" />
      <path d="M9.6 12.2c3-1.6 5 1.2 2.2 2.6 3 .4 2.2 4.6-2.2 4" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

/** Dégradés partagés par toutes les icônes (à placer une fois dans la page). */
export function IconDefs() {
  const lg = (id: string, stops: [string, string][]) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {lg('gGold', [['0', '#fff3b0'], ['0.45', '#ffc933'], ['1', '#e08a00']])}
        {lg('gGoldDark', [['0', '#ffd95e'], ['1', '#c77a00']])}
        {lg('gBlue', [['0', '#bdf3ff'], ['0.5', '#35c8ff'], ['1', '#1479d6']])}
        {lg('gSilver', [['0', '#ffffff'], ['0.5', '#cfd6e6'], ['1', '#8e9ab3']])}
        {lg('gSilverDark', [['0', '#b8c2d8'], ['1', '#6c7894']])}
        {lg('gWood', [['0', '#e49a4a'], ['0.5', '#b0621f'], ['1', '#7a3f12']])}
        {lg('gRed', [['0', '#ff9a9a'], ['0.5', '#e63946'], ['1', '#a1182a']])}
        {lg('gOrange', [['0', '#ffd166'], ['0.5', '#ff9f1c'], ['1', '#e0561a']])}
        {lg('gGreen', [['0', '#b9f6a0'], ['0.5', '#5bd75b'], ['1', '#2c9a3c']])}
      </defs>
    </svg>
  );
}

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
