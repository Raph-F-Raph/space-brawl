import type { Character, Ship } from '../types';

const INK = '#0b1030';

interface ArtProps {
  color: string;
  accent: string;
  variant: number; // 1 à 4 : forme différente pour chaque personnage / soucoupe
  size?: number | string; // largeur (nombre = px, ou "100%")
}

/** Personnage en astronaute rigolo, dessiné en SVG (aucune image à télécharger). */
export function CharacterArt({
  color,
  accent,
  variant,
  size = 110,
  headOnly = false,
}: ArtProps & { headOnly?: boolean }) {
  return (
    <svg
      viewBox={headOnly ? '14 12 72 72' : '0 0 100 112'}
      style={{ width: size, height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* Éléments derrière le casque */}
      {variant === 2 && (
        <>
          <line x1="30" y1="26" x2="22" y2="10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="22" cy="10" r="6" fill={accent} stroke={INK} strokeWidth="4" />
          <line x1="70" y1="26" x2="78" y2="10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="78" cy="10" r="6" fill={accent} stroke={INK} strokeWidth="4" />
        </>
      )}
      {variant === 4 && (
        <>
          <polygon points="28,30 20,6 42,22" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="72,30 80,6 58,22" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}

      {/* Corps */}
      {!headOnly && (
        <>
          {variant === 4 && (
            <>
              <circle cx="22" cy="88" r="13" fill={color} stroke={INK} strokeWidth="5" />
              <circle cx="78" cy="88" r="13" fill={color} stroke={INK} strokeWidth="5" />
            </>
          )}
          <ellipse cx="50" cy="92" rx="24" ry="18" fill={color} stroke={INK} strokeWidth="5" />
          <ellipse cx="50" cy="97" rx="20" ry="11" fill="#000" opacity="0.16" />
          <circle cx="50" cy="90" r="6" fill={accent} stroke={INK} strokeWidth="3" />
        </>
      )}

      {/* Casque */}
      <circle cx="50" cy="48" r="31" fill={color} stroke={INK} strokeWidth="5" />
      <path d="M28 36 A24 24 0 0 1 48 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.45" />
      {variant === 3 && (
        <polygon
          points="54,12 42,30 51,30 46,44 60,24 51,24"
          fill={accent}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      {/* Visière + yeux */}
      <rect x="26" y="40" width="48" height="26" rx="13" fill="#121a45" stroke={INK} strokeWidth="4" />
      <circle cx="40" cy="53" r="5" fill="#fff" />
      <circle cx="60" cy="53" r="5" fill="#fff" />
      <circle cx="41.5" cy="54" r="2.2" fill={INK} />
      <circle cx="61.5" cy="54" r="2.2" fill={INK} />
    </svg>
  );
}

/** Soucoupe volante en SVG. */
export function ShipArt({ color, accent, variant, size = 200 }: ArtProps) {
  const lights: [number, number][] = [
    [30, 66],
    [55, 72],
    [80, 74],
    [105, 72],
    [130, 66],
  ];
  return (
    <svg
      viewBox="-25 0 210 100"
      style={{ width: size, height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* Derrière la soucoupe */}
      {variant === 3 && (
        <path d="M -8 62 A 88 14 0 0 1 168 62" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
      )}
      {variant === 4 && (
        <>
          <polygon points="12,56 -24,42 -10,62 -26,80 14,74" fill="#ff9f1c" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="12,60 -8,54 -2,64 -10,72 12,70" fill="#ffd23f" />
        </>
      )}
      {variant === 2 && (
        <>
          <polygon points="12,62 -16,36 22,52" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="148,62 176,36 138,52" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}

      {/* Dôme */}
      <ellipse cx="80" cy="40" rx="36" ry="30" fill="#bdefff" stroke={INK} strokeWidth="5" />
      <ellipse cx="66" cy="28" rx="10" ry="6" fill="#fff" opacity="0.5" />

      {/* Disque */}
      <ellipse cx="80" cy="64" rx="74" ry="24" fill={color} stroke={INK} strokeWidth="5" />
      <ellipse cx="80" cy="70" rx="60" ry="10" fill="#000" opacity="0.18" />
      {lights.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" fill={accent} stroke={INK} strokeWidth="2.5" />
      ))}

      {variant === 3 && (
        <path d="M -8 62 A 88 14 0 0 0 168 62" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Soucoupe avec la tête du pilote visible dans le dôme. */
export function ShipWithPilot({
  ship,
  character,
  size = 320,
}: {
  ship: Ship | null;
  character: Character | null;
  size?: number | string;
}) {
  return (
    <div className="ship-pilot" style={{ width: size }}>
      <ShipArt
        color={ship?.color ?? '#9aa7c7'}
        accent={ship?.accent ?? '#ffd23f'}
        variant={ship?.sort_order ?? 1}
        size="100%"
      />
      {character && (
        <div className="pilot">
          <CharacterArt
            color={character.color}
            accent={character.accent}
            variant={character.sort_order}
            size="100%"
            headOnly
          />
        </div>
      )}
    </div>
  );
}
