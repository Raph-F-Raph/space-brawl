import { useId } from 'react';
import type { Character, Ship } from '../types';

const INK = '#0b1030';

interface ArtProps {
  color: string;
  accent: string;
  variant: number; // 1 à 5 : forme différente pour chaque personnage / soucoupe (5 = noir et jaune, thème frelon)
  size?: number | string; // largeur (nombre = px, ou "100%")
}

/**
 * Personnage dessiné en SVG (aucune image à télécharger) : grosse tête, corps, bras, mains, jambes et bottes.
 * variant : 1 Cosmo, 2 Nova, 3 Volt, 4 Titan, 5 Frelon.
 * `headOnly` ne montre que la tête (pour le dôme de la soucoupe) : la tête garde les mêmes coordonnées.
 */
export function CharacterArt({
  color,
  accent,
  variant,
  size = 110,
  headOnly = false,
  look = null,
}: ArtProps & { headOnly?: boolean; look?: string | null }) {
  const clipId = useId().replace(/:/g, '');
  const big = variant === 4; // Titan : plus large
  const handColor = variant === 4 ? color : variant === 6 ? '#ffd23f' : accent;
  const torso = big ? { x: 11, y: 78, w: 78, h: 31, rx: 15 } : { x: 21, y: 78, w: 58, h: 31, rx: 15 };
  const legW = big ? 26 : 22;
  const legX: [number, number] = big ? [22, 52] : [27, 51];
  const bootRx = big ? 18 : 15.5;
  const armW = big ? 30 : 25;
  const handR = big ? 14 : 12.5;
  const hands: [[number, number], [number, number]] = big ? [[4, 114], [96, 114]] : [[10, 113], [90, 113]];
  const shoulders: [[number, number], [number, number]] = big ? [[19, 90], [81, 90]] : [[27, 90], [73, 90]];

  return (
    <svg
      viewBox={headOnly ? '12 10 76 76' : '-15 0 130 148'}
      style={{ width: size, height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* Ombre au sol */}
      {!headOnly && <ellipse cx="50" cy="141" rx={big ? 44 : 38} ry="5" fill="#000" opacity="0.28" />}

      {/* Éléments derrière le corps et la tête */}
      {variant === 2 && (
        <>
          <line x1="30" y1="26" x2="22" y2="10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="22" cy="10" r="6" fill={accent} stroke={INK} strokeWidth="4" />
          <line x1="70" y1="26" x2="78" y2="10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="78" cy="10" r="6" fill={accent} stroke={INK} strokeWidth="4" />
        </>
      )}
      {variant === 7 && (
        <>
          <line x1="50" y1="16" x2="50" y2="2" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="3" r="6" fill={accent} stroke={INK} strokeWidth="3.5" />
          <rect x="10" y="40" width="10" height="16" rx="4" fill={accent} stroke={INK} strokeWidth="3.5" />
          <rect x="80" y="40" width="10" height="16" rx="4" fill={accent} stroke={INK} strokeWidth="3.5" />
        </>
      )}
      {variant === 8 && (
        <>
          <path d="M30 30 Q18 12 28 2 Q30 16 42 22 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M70 30 Q82 12 72 2 Q70 16 58 22 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          {!headOnly && <ellipse cx="50" cy="132" rx="30" ry="14" fill={accent} opacity="0.3" />}
        </>
      )}
      {variant === 4 && (
        <>
          <polygon points="28,30 20,6 42,22" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="72,30 80,6 58,22" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 6 && (
        <>
          {/* aura dorée + étincelles */}
          {!headOnly && (
            <>
              <circle cx="50" cy="70" r="62" fill="#ffd23f" opacity="0.14" />
              <circle cx="50" cy="70" r="46" fill="#ffd23f" opacity="0.12" />
              <polygon points="-6,40 -2,48 6,52 -2,56 -6,64 -10,56 -18,52 -10,48" fill="#ffe08a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <polygon points="106,24 109,30 115,33 109,36 106,42 103,36 97,33 103,30" fill="#ffe08a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              {/* cape */}
              <path d="M26 82 Q8 112 22 140 L50 128 L78 140 Q92 112 74 82 Z" fill="#7b2cbf" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
              <path d="M30 86 Q16 112 27 134" stroke="#c77dff" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
        </>
      )}
      {variant === 6 && !headOnly && (
        <>
          <defs>
            <radialGradient id={`${clipId}aura`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff3b0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="80" rx="66" ry="68" fill={`url(#${clipId}aura)`} />
          <path d="M72 112 Q112 108 104 78 Q100 62 88 66" stroke={INK} strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M72 112 Q112 108 104 78 Q100 62 88 66" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="88" cy="66" r="4.5" fill="#fff3b0" stroke={INK} strokeWidth="2.5" />
        </>
      )}
      {variant === 6 && (
        <>
          <polygon points="22,44 20,8 46,24" fill={color} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          <polygon points="27,34 26,17 39,26" fill={accent} />
          <polygon points="78,44 80,8 54,24" fill={color} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          <polygon points="73,34 74,17 61,26" fill={accent} />
        </>
      )}
      {variant === 5 && (
        <>
          {/* petites antennes du casque */}
          <path d="M41 19 Q37 15 31 15" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="31" cy="15" r="3.5" fill={accent} stroke={INK} strokeWidth="2.5" />
          <path d="M59 19 Q63 15 69 15" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="69" cy="15" r="3.5" fill={accent} stroke={INK} strokeWidth="2.5" />
          {/* ailes dans le dos */}
          {!headOnly && (
            <>
              <ellipse cx="24" cy="76" rx="17" ry="7.5" transform="rotate(-28 24 76)" fill="#fff" opacity="0.55" stroke={INK} strokeWidth="3.5" />
              <ellipse cx="76" cy="76" rx="17" ry="7.5" transform="rotate(28 76 76)" fill="#fff" opacity="0.55" stroke={INK} strokeWidth="3.5" />
            </>
          )}
        </>
      )}

      {/* Corps entier : jambes, bottes, torse, bras, mains */}
      {!headOnly && (
        <>
          {/* jambes */}
          {legX.map((x) => (
            <g key={x}>
              <rect x={x} y="102" width={legW} height="27" rx="10" fill={color} stroke={INK} strokeWidth="4.5" />
              <rect x={x + 3} y="114" width={legW - 6} height="12" rx="4" fill="#000" opacity="0.2" />
            </g>
          ))}
          {/* bottes */}
          <ellipse cx={legX[0] + legW / 2} cy="130" rx={bootRx} ry="9" fill={accent} stroke={INK} strokeWidth="4.5" />
          <ellipse cx={legX[1] + legW / 2} cy="130" rx={bootRx} ry="9" fill={accent} stroke={INK} strokeWidth="4.5" />

          {/* torse */}
          <defs>
            <clipPath id={clipId}>
              <rect x={torso.x} y={torso.y} width={torso.w} height={torso.h} rx={torso.rx} />
            </clipPath>
          </defs>
          <rect x={torso.x} y={torso.y} width={torso.w} height={torso.h} rx={torso.rx} fill={color} />
          <g clipPath={`url(#${clipId})`}>
            <rect x={torso.x} y={torso.y + torso.h - 12} width={torso.w} height="12" fill="#000" opacity="0.18" />
            {variant === 5 && (
              <>
                <rect x={torso.x} y="84" width={torso.w} height="5.5" fill={accent} />
                <rect x={torso.x} y="93" width={torso.w} height="5.5" fill={accent} />
                <rect x={torso.x} y="102" width={torso.w} height="5.5" fill={accent} />
              </>
            )}
          </g>
          <rect x={torso.x} y={torso.y} width={torso.w} height={torso.h} rx={torso.rx} fill="none" stroke={INK} strokeWidth="5" />

          {/* emblème sur la poitrine */}
          {variant === 1 && <circle cx="50" cy="88" r="5.5" fill={accent} stroke={INK} strokeWidth="3" />}
          {variant === 2 && (
            <polygon
              points="50,82 52.2,86.8 57.4,87.3 53.5,90.7 54.7,95.8 50,93.1 45.3,95.8 46.5,90.7 42.6,87.3 47.8,86.8"
              fill={accent}
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}
          {variant === 3 && (
            <polygon
              points="53,79 44,92 50,92 47,101 57,87 51,87"
              fill={accent}
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}
          {variant === 7 && (
            <>
              <rect x="40" y="80" width="20" height="16" rx="3" fill={accent} stroke={INK} strokeWidth="2.5" />
              <path d="M44 85 H56 M44 90 H56" stroke={INK} strokeWidth="2" />
            </>
          )}
          {variant === 8 && (
            <path d="M56 80 A9 9 0 1 0 56 97 A7 7 0 1 1 56 80 Z" fill={accent} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          )}
          {variant === 6 && (
            <>
              <rect x="21" y="99" width="58" height="7" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
              <circle cx="50" cy="102.5" r="4.5" fill="#fff" stroke={INK} strokeWidth="2.5" />
              <circle cx="27" cy="88" r="7" fill="#ffd166" stroke={INK} strokeWidth="3" />
              <circle cx="73" cy="88" r="7" fill="#ffd166" stroke={INK} strokeWidth="3" />
            </>
          )}
          {variant === 6 && (
            <>
              <ellipse cx="50" cy="94" rx="6" ry="5" fill={accent} stroke={INK} strokeWidth="2.5" />
              {[-8, 0, 8].map((dx) => (
                <circle key={dx} cx={50 + dx} cy="85" r="2.8" fill={accent} stroke={INK} strokeWidth="2" />
              ))}
            </>
          )}
          {variant === 4 && (
            <>
              <circle cx="50" cy="93" r="9" fill={accent} stroke={INK} strokeWidth="3.5" />
              <circle cx="50" cy="93" r="3.5" fill={color} />
            </>
          )}

          {/* ceinture */}
          {variant !== 5 && (
            <>
              <rect x={torso.x + 2} y="100" width={torso.w - 4} height="6" rx="3" fill="#000" opacity="0.3" />
              <rect x="45" y="99" width="10" height="8" rx="2" fill={accent} stroke={INK} strokeWidth="2.5" />
            </>
          )}

          {/* bras + mains */}
          {[0, 1].map((i) => (
            <g key={i}>
              <line
                x1={shoulders[i][0]}
                y1={shoulders[i][1]}
                x2={hands[i][0]}
                y2={hands[i][1] - 3}
                stroke={INK}
                strokeWidth={armW}
                strokeLinecap="round"
              />
              <line
                x1={shoulders[i][0]}
                y1={shoulders[i][1]}
                x2={hands[i][0]}
                y2={hands[i][1] - 3}
                stroke={color}
                strokeWidth={armW - 8}
                strokeLinecap="round"
              />
              <circle cx={hands[i][0]} cy={hands[i][1]} r={handR} fill={handColor} stroke={INK} strokeWidth="4.5" />
              <circle cx={hands[i][0] - handR / 3} cy={hands[i][1] - handR / 3} r={handR / 4} fill="#fff" opacity="0.5" />
            </g>
          ))}
        </>
      )}

      {/* Casque */}
      <circle cx="50" cy="48" r="34" fill={color} stroke={INK} strokeWidth="5" />
      <path d="M28 36 A24 24 0 0 1 48 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity={variant === 5 ? 0.3 : 0.45} />
      {variant === 3 && (
        <polygon
          points="54,12 42,30 51,30 46,44 60,24 51,24"
          fill={accent}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
      {variant === 5 && (
        <>
          <line x1="44" y1="18.5" x2="44" y2="40" stroke={accent} strokeWidth="4.5" />
          <line x1="56" y1="18.5" x2="56" y2="40" stroke={accent} strokeWidth="4.5" />
        </>
      )}

      {variant === 6 && (
        <>
          <polygon points="50,9 56,22 50,30 44,22" fill="#ffd23f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="21" r="2.6" fill="#e63946" stroke={INK} strokeWidth="1.5" />
          <path d="M26 20 Q50 8 74 20" stroke="#ffd23f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* Visière + yeux */}
      {variant !== 5 ? (
        <>
          <rect x="23" y="39" width="54" height="29" rx="14.5" fill="#121a45" stroke={INK} strokeWidth="4" />
          <circle cx="39" cy="53" r="6" fill="#fff" />
          <circle cx="61" cy="53" r="6" fill="#fff" />
          <circle cx="40.5" cy="54.5" r="2.6" fill={INK} />
          <circle cx="62.5" cy="54.5" r="2.6" fill={INK} />
          {variant === 6 && (
            <>
              <path d="M17 54 L3 50 M17 60 L4 62 M83 54 L97 50 M83 60 L96 62" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
              <path d="M17 54 L3 50 M17 60 L4 62 M83 54 L97 50 M83 60 L96 62" stroke="#ffd23f" strokeWidth="1" strokeLinecap="round" />
              <polygon points="50,60 46,64 54,64" fill="#ffd23f" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
            </>
          )}
        </>
      ) : (
        <>
          {/* visière de moto avec deux gros yeux jaunes d'insecte */}
          <rect x="20" y="39" width="60" height="30" rx="15" fill="#0a0a0e" stroke={INK} strokeWidth="4" />
          {[39, 61].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="54" rx="10" ry="11" fill={accent} stroke={INK} strokeWidth="2.5" />
              <path
                d={`M${cx - 7} 48 H${cx + 7} M${cx - 9} 54 H${cx + 9} M${cx - 7} 60 H${cx + 7} M${cx - 3} 44 V64 M${cx + 3.5} 44.5 V63.5`}
                stroke="#b38f00"
                strokeWidth="1.1"
                fill="none"
              />
              <ellipse cx={cx - 3.5} cy="49" rx="3" ry="2.2" fill="#fff" opacity="0.75" />
            </g>
          ))}
        </>
      )}
      {/* Accessoires des skins (dessinés par-dessus le casque) */}
      {variant === 7 && (
        <>
          <circle cx="30" cy="28" r="2.5" fill={INK} opacity="0.6" />
          <circle cx="70" cy="28" r="2.5" fill={INK} opacity="0.6" />
          <path d="M36 72 H64" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        </>
      )}
      {variant === 8 && (
        <>
          <path d="M18 60 Q10 70 16 78 M82 60 Q90 70 84 78" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M84 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 6 && (
        <>
          <path d="M44 22 L50 14 L56 22 L50 30 Z" fill="#ffd166" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="22" r="2.4" fill="#fff" />
          <path d="M17 52 L6 48 M17 58 L5 60 M83 52 L94 48 M83 58 L95 60" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M24 12 L21 8 M76 12 L79 8" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" />
          <path d="M90 28 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M8 34 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#fff" stroke="#ffd166" strokeWidth="1.2" />
        </>
      )}
      {look === 'crown' && (
        <g>
          <polygon points="30,25 33,10 42,19 50,8 58,19 67,10 70,25" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="50" cy="19" r="2.6" fill="#fff" stroke={INK} strokeWidth="1.5" />
        </g>
      )}
      {look === 'bandana' && (
        <g>
          <path d="M16 40 Q50 12 84 40" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
          <path d="M16 40 Q50 12 84 40" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" />
          <polygon points="80,36 96,30 94,46" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="22" r="2.2" fill="#fff" />
          <circle cx="38" cy="26" r="1.8" fill="#fff" />
          <circle cx="62" cy="26" r="1.8" fill="#fff" />
        </g>
      )}
      {look === 'headband' && (
        <g>
          <line x1="17" y1="34" x2="83" y2="34" stroke={INK} strokeWidth="12" strokeLinecap="round" />
          <line x1="17" y1="34" x2="83" y2="34" stroke={accent} strokeWidth="6.5" strokeLinecap="round" />
          <path d="M82 34 Q96 32 98 46" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <path d="M82 34 Q96 32 98 46" fill="none" stroke={accent} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M82 36 Q95 42 92 55" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <path d="M82 36 Q95 42 92 55" fill="none" stroke={accent} strokeWidth="4.5" strokeLinecap="round" />
        </g>
      )}
      {look === 'halo' && (
        <g>
          <ellipse cx="50" cy="13" rx="22" ry="6" fill="none" stroke={INK} strokeWidth="9" />
          <ellipse cx="50" cy="13" rx="22" ry="6" fill="none" stroke={accent} strokeWidth="4.5" />
        </g>
      )}
      {look === 'flame' && (
        <path d="M33 26 Q28 13 38 6 Q38 15 45 17 Q45 9 51 3 Q55 13 60 17 Q67 11 65 5 Q76 14 67 28 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {look === 'frost' && (
        <g fill="#e8fbff" stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <polygon points="31,27 36,9 45,23" />
          <polygon points="42,22 50,3 58,22" />
          <polygon points="55,23 64,9 69,27" />
          <polygon points="46,20 50,10 54,20" fill={accent} stroke="none" />
        </g>
      )}
    </svg>
  );
}

/** Soucoupe volante en SVG. */
export function ShipArt({ color, accent, variant, size = 200 }: ArtProps) {
  const clipId = useId().replace(/:/g, '');
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
      {variant === 5 && (
        <polygon points="14,56 -24,64 14,74" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      )}
      {variant === 6 && (
        <>
          <ellipse cx="80" cy="60" rx="96" ry="40" fill="#c77dff" opacity="0.18" />
          <ellipse cx="80" cy="60" rx="84" ry="32" fill="#ffd23f" opacity="0.14" />
          <polygon points="-18,14 -15,21 -8,24 -15,27 -18,34 -21,27 -28,24 -21,21" fill="#ffe08a" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points="168,10 171,17 178,20 171,23 168,30 165,23 158,20 165,17" fill="#ffe08a" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        </>
      )}
      {variant === 7 && (
        <>
          <polygon points="14,58 -22,48 -10,64 -22,78 14,72" fill="#ff9f1c" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="12,62 -8,58 -2,64 -8,70 12,68" fill="#ffe66d" />
          <polygon points="60,84 80,98 100,84" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 8 && (
        <>
          <path d="M10 60 Q-18 40 -22 12 Q10 28 28 50 Z" fill={accent} opacity="0.85" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M150 60 Q178 40 182 12 Q150 28 132 50 Z" fill={accent} opacity="0.85" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="80" cy="64" rx="84" ry="32" fill={accent} opacity="0.2" />
        </>
      )}
      {variant === 6 && (
        <>
          <ellipse cx="80" cy="64" rx="86" ry="34" fill="#fff3b0" opacity="0.22" />
        </>
      )}
      {variant === 6 && (
        <>
          <path d="M 10 62 Q -22 52 -14 24 Q -4 46 24 52 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M 150 62 Q 182 52 174 24 Q 164 46 136 52 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 2 && (
        <>
          <polygon points="12,62 -16,36 22,52" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="148,62 176,36 138,52" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}

      {variant === 5 && (
        <>
          {/* petites ailes de chaque côté */}
          <ellipse cx="-2" cy="46" rx="24" ry="9" transform="rotate(-24 -2 46)" fill="#fff" opacity="0.55" stroke={INK} strokeWidth="4" />
          <ellipse cx="162" cy="46" rx="24" ry="9" transform="rotate(24 162 46)" fill="#fff" opacity="0.55" stroke={INK} strokeWidth="4" />
          {/* dard sous la soucoupe */}
          <polygon points="70,80 80,99 90,80" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}

      {/* Dôme */}
      <ellipse cx="80" cy="40" rx="36" ry="30" fill="#bdefff" stroke={INK} strokeWidth="5" />
      <ellipse cx="66" cy="28" rx="10" ry="6" fill="#fff" opacity="0.5" />

      {/* Disque */}
      <ellipse cx="80" cy="64" rx="74" ry="24" fill={color} stroke={INK} strokeWidth="5" />
      {variant === 5 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <ellipse cx="80" cy="64" rx="74" ry="24" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {[14, 46, 78, 110, 142].map((x) => (
              <polygon key={x} points={`${x},38 ${x + 12},38 ${x + 2},92 ${x - 10},92`} fill={accent} />
            ))}
          </g>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={INK} strokeWidth="5" />
        </>
      )}
      {variant === 5 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <ellipse cx="80" cy="64" rx="74" ry="24" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {[34, 68, 102].map((x) => (
              <rect key={x} x={x} y="36" width="14" height="60" fill={accent} />
            ))}
          </g>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={INK} strokeWidth="5" />
        </>
      )}
      <ellipse cx="80" cy="70" rx="60" ry="10" fill="#000" opacity="0.18" />
      {lights.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="5" fill={variant === 5 ? '#fff' : accent} stroke={INK} strokeWidth="2.5" />
      ))}

      {variant === 6 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke="#ffd23f" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
          <path d="M60 22 L66 8 L73 18 L80 4 L87 18 L94 8 L100 22 Z" fill="#ffd23f" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="80" cy="9" r="2.6" fill="#e63946" stroke={INK} strokeWidth="1.5" />
          <polygon points="80,96 70,84 90,84" fill="#ffd23f" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </>
      )}
      {variant === 7 && (
        <>
          <path d="M40 54 L120 54 M30 62 L130 62" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <circle cx="80" cy="64" r="0" />
        </>
      )}
      {variant === 8 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={accent} strokeWidth="3" />
          <path d="M20 84 q6 10 12 0 q6 10 12 0 M116 84 q6 10 12 0 q6 10 12 0" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 6 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke="#ffd166" strokeWidth="3.5" strokeDasharray="2 0" />
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.5" />
          <path d="M 36 28 Q 80 -2 124 28" stroke="#ffd166" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M 142 14 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z M 10 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M 150 84 l1.8 4.5 4.5 1.8 -4.5 1.8 -1.8 4.5 -1.8 -4.5 -4.5 -1.8 4.5 -1.8z" fill="#fff" stroke="#ffd166" strokeWidth="1.2" />
        </>
      )}
      {variant === 6 && (
        <polygon
          points="80,52 83,60 92,60 85,65 88,73 80,68 72,73 75,65 68,60 77,60"
          fill="#fff"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
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
            look={character.style}
            size="100%"
            headOnly
          />
        </div>
      )}
    </div>
  );
}
