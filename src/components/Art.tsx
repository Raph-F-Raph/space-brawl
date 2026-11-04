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
      {variant === 9 && (
        <>
          <polygon points="30,26 24,4 40,18" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="50,18 50,-2 58,16" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="72,26 78,4 62,18" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </>
      )}
      {variant === 10 && (
        <>
          <path d="M26 30 Q10 8 22 -2 Q26 14 40 18 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M74 30 Q90 8 78 -2 Q74 14 60 18 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          {!headOnly && <rect x="14" y="76" width="72" height="8" rx="4" fill={accent} stroke={INK} strokeWidth="3" />}
        </>
      )}
      {variant === 11 && (
        <>
          {[-70, -45, -20, 20, 45, 70].map((a) => (
            <polygon key={a} points="50,48 44,-6 56,-6" fill="#ffd166" stroke={INK} strokeWidth="3" strokeLinejoin="round" transform={`rotate(${a} 50 48)`} />
          ))}
          {!headOnly && <circle cx="50" cy="80" r="64" fill="#ffd166" opacity="0.15" />}
        </>
      )}
      {variant === 12 && (
        <>
          <path d="M24 36 Q12 14 28 4 Q28 16 40 17 Q42 4 58 2 Q56 12 66 14 Q82 8 76 36 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M37 32 Q35 19 46 12 Q48 21 56 23 Q62 17 65 32 Z" fill={accent} />
          {!headOnly && <ellipse cx="50" cy="132" rx="30" ry="14" fill={color} opacity="0.3" />}
        </>
      )}
      {variant === 13 && (
        <>
          <path d="M26 34 L16 6 L44 24 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M74 34 L84 6 L56 24 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          {!headOnly && (
            <>
              <path d="M22 82 Q-8 90 2 124 Q20 112 28 98 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M78 82 Q108 90 98 124 Q80 112 72 98 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
            </>
          )}
        </>
      )}
      {variant === 14 && (
        <>
          <path d="M24 44 Q2 56 10 84 Q16 94 22 84 Q14 68 32 60 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M76 44 Q98 56 90 84 Q84 94 78 84 Q86 68 68 60 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="11" cy="72" r="2.6" fill={accent} />
          <circle cx="89" cy="72" r="2.6" fill={accent} />
          {!headOnly && <ellipse cx="50" cy="132" rx="32" ry="14" fill={accent} opacity="0.25" />}
        </>
      )}
      {variant === 15 && (
        <>
          <path d="M20 40 Q4 36 6 52 Q12 60 24 54" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M80 40 Q96 36 94 52 Q88 60 76 54" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M22 62 Q8 66 10 78" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M78 62 Q92 66 90 78" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {variant === 16 && (
        <>
          <polygon points="14,40 6,26 22,22 28,36" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="86,40 94,26 78,22 72,36" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="30,24 38,8 50,18 62,6 70,24" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </>
      )}
      {variant === 17 && (
        <>
          <path d="M20 54 Q-10 40 -4 8 Q14 24 30 30 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M80 54 Q110 40 104 8 Q86 24 70 30 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M14 38 Q6 24 6 14 M86 38 Q94 24 94 14" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          {!headOnly && <ellipse cx="50" cy="132" rx="30" ry="14" fill={accent} opacity="0.3" />}
        </>
      )}
      {variant === 18 && (
        <>
          <line x1="68" y1="22" x2="80" y2="2" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="82" cy="4" rx="9" ry="5" transform="rotate(-30 82 4)" fill={accent} stroke={INK} strokeWidth="3.5" />
          <rect x="8" y="38" width="12" height="22" rx="4" fill={accent} stroke={INK} strokeWidth="3.5" />
          <rect x="80" y="38" width="12" height="22" rx="4" fill={accent} stroke={INK} strokeWidth="3.5" />
        </>
      )}
      {variant === 19 && (
        <>
          <path d="M22 40 Q-4 60 8 96 Q14 84 22 88 Q18 70 30 58 Z" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" opacity="0.92" />
          <path d="M78 40 Q104 60 92 96 Q86 84 78 88 Q82 70 70 58 Z" fill="#fff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" opacity="0.92" />
          {!headOnly && <ellipse cx="50" cy="132" rx="28" ry="12" fill={accent} opacity="0.3" />}
        </>
      )}
      {variant === 20 && (
        <>
          <circle cx="18" cy="26" r="11" fill={color} stroke={INK} strokeWidth="4" />
          <circle cx="82" cy="26" r="11" fill={color} stroke={INK} strokeWidth="4" />
          <circle cx="18" cy="26" r="5" fill={accent} />
          <circle cx="82" cy="26" r="5" fill={accent} />
        </>
      )}
      {variant === 21 && (
        <>
          <path d="M26 34 Q8 14 14 -4 Q28 8 40 18 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M74 34 Q92 14 86 -4 Q72 8 60 18 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          {!headOnly && (
            <>
              <path d="M22 84 Q-14 70 -10 108 Q8 100 26 100 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M78 84 Q114 70 110 108 Q92 100 74 100 Z" fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
            </>
          )}
        </>
      )}
      {variant === 22 && (
        <>
          <ellipse cx="50" cy="42" rx="46" ry="42" fill="none" stroke={accent} strokeWidth="5" opacity="0.9" />
          <ellipse cx="50" cy="42" rx="46" ry="42" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="0" r="4" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="4" cy="42" r="3.2" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="96" cy="42" r="3.2" fill="#fff" stroke={INK} strokeWidth="2" />
        </>
      )}
      {variant === 23 && (
        <>
          <circle cx="50" cy="44" r="52" fill={accent} opacity="0.16" />
          <ellipse cx="50" cy="44" rx="50" ry="14" fill="none" stroke={accent} strokeWidth="3.5" transform="rotate(-18 50 44)" />
          <circle cx="2" cy="56" r="5" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
          <circle cx="98" cy="32" r="4" fill="#fff" stroke={INK} strokeWidth="2.5" />
          {!headOnly && <ellipse cx="50" cy="132" rx="32" ry="14" fill={accent} opacity="0.25" />}
        </>
      )}
      {variant === 24 && (
        <>
          <path d="M20 40 Q-6 52 4 80 Q10 100 -2 118" stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M80 40 Q106 52 96 80 Q90 100 102 118" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M20 40 Q-6 52 4 80 Q10 100 -2 118 M80 40 Q106 52 96 80 Q90 100 102 118" stroke={INK} strokeWidth="1.6" fill="none" opacity="0.4" />
        </>
      )}
      {variant === 25 && (
        <>
          <rect x="8" y="38" width="12" height="22" rx="6" fill={accent} stroke={INK} strokeWidth="3.5" />
          <rect x="80" y="38" width="12" height="22" rx="6" fill={accent} stroke={INK} strokeWidth="3.5" />
          <path d="M20 30 Q50 -4 80 30" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 26 && (
        <>
          <circle cx="50" cy="14" r="9" fill={accent} stroke={INK} strokeWidth="3.5" />
          <circle cx="50" cy="14" r="3.4" fill={INK} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect key={a} x="47.5" y="1" width="5" height="5" rx="1.2" fill={accent} stroke={INK} strokeWidth="1.8" transform={`rotate(${a} 50 14)`} />
          ))}
          <rect x="10" y="42" width="10" height="14" rx="3" fill={accent} stroke={INK} strokeWidth="3.2" />
          <rect x="80" y="42" width="10" height="14" rx="3" fill={accent} stroke={INK} strokeWidth="3.2" />
        </>
      )}
      {variant === 27 && (
        <>
          <path d="M16 56 Q8 70 16 84 M84 56 Q92 70 84 84" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
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
          {variant === 9 && (
            <path d="M50 78 L58 90 L50 102 L42 90 Z" fill={accent} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          )}
          {variant === 10 && (
            <>
              <path d="M30 80 L70 100 M70 80 L30 100" stroke={accent} strokeWidth="5" strokeLinecap="round" />
              <circle cx="50" cy="90" r="6" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
            </>
          )}
          {variant === 11 && (
            <>
              <circle cx="50" cy="91" r="11" fill="#fff3b0" stroke={INK} strokeWidth="3" />
              <circle cx="50" cy="91" r="5.5" fill={accent} />
            </>
          )}
          {variant === 12 && (
            <path d="M50 78 Q60 88 53 100 Q50 95 47 100 Q40 88 50 78 Z" fill={accent} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          )}
          {variant === 13 && (
            <>
              <circle cx="50" cy="90" r="11" fill="#fff" stroke={INK} strokeWidth="2.8" />
              <circle cx="50" cy="90" r="5.5" fill={accent} stroke={INK} strokeWidth="2" />
              <circle cx="50" cy="90" r="2.2" fill={INK} />
            </>
          )}
          {variant === 14 && (
            <>
              <path d="M36 86 Q43 80 50 86 Q57 92 64 86" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M36 96 Q43 90 50 96 Q57 102 64 96" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          )}
          {variant === 15 && (
            <path d="M38 88 Q44 80 50 86 Q56 92 62 84 M38 96 Q44 90 50 95 Q56 100 62 94" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          )}
          {variant === 16 && (
            <>
              <path d="M36 80 L44 90 L40 100 M62 80 L56 92 L64 102" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="50,82 56,90 50,98 44,90" fill={accent} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            </>
          )}
          {variant === 17 && (
            <path d="M50 78 Q62 88 54 102 Q50 96 46 102 Q38 88 50 78 Z M50 86 Q55 92 51 98 Q47 92 50 86 Z" fill={accent} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" fillRule="evenodd" />
          )}
          {variant === 18 && (
            <>
              <path d="M32 82 L50 94 L68 82" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="100" r="3.2" fill="#fff" stroke={INK} strokeWidth="2" />
            </>
          )}
          {variant === 19 && (
            <>
              <path d="M36 82 Q43 76 50 82 Q57 88 64 82 L62 100 Q56 94 50 100 Q44 94 38 100 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="45" cy="88" r="2" fill={INK} />
              <circle cx="55" cy="88" r="2" fill={INK} />
            </>
          )}
          {variant === 20 && (
            <>
              <rect x="30" y="82" width="40" height="16" rx="5" fill={accent} stroke={INK} strokeWidth="2.5" />
              {[36, 46, 56, 64].map((x) => (
                <circle key={x} cx={x} cy="90" r="2" fill="#fff" stroke={INK} strokeWidth="1.2" />
              ))}
            </>
          )}
          {variant === 21 && (
            <>
              {[36, 46, 56].map((x) => (
                <path key={x} d={`M${x - 8} 94 Q${x} 82 ${x + 8} 94`} fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
              ))}
              {[41, 51].map((x) => (
                <path key={x} d={`M${x - 8} 102 Q${x} 90 ${x + 8} 102`} fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
              ))}
            </>
          )}
          {variant === 22 && (
            <>
              <path d="M32 90 Q50 76 68 90 Q50 104 32 90 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
              <circle cx="50" cy="90" r="6" fill={accent} stroke={INK} strokeWidth="2.4" />
              <circle cx="50" cy="90" r="2.4" fill={INK} />
            </>
          )}
          {variant === 23 && (
            <>
              <circle cx="50" cy="90" r="9" fill={accent} stroke={INK} strokeWidth="2.8" />
              <ellipse cx="50" cy="90" rx="17" ry="4.5" fill="none" stroke="#fff" strokeWidth="3" transform="rotate(-20 50 90)" />
            </>
          )}
          {variant === 24 && (
            <path d="M32 84 Q41 76 50 84 Q59 92 68 84 M32 92 Q41 84 50 92 Q59 100 68 92" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
          {variant === 25 && (
            <>
              <circle cx="50" cy="90" r="10" fill="none" stroke={accent} strokeWidth="4" />
              <circle cx="50" cy="90" r="3.4" fill={accent} stroke={INK} strokeWidth="2" />
            </>
          )}
          {variant === 26 && (
            <>
              <rect x="34" y="82" width="32" height="16" rx="4" fill="#fff" stroke={INK} strokeWidth="2.6" />
              <path d="M38 90 H44 L47 85 L51 95 L54 90 H62" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {variant === 27 && (
            <>
              <circle cx="50" cy="82" r="3" fill="none" stroke={accent} strokeWidth="2.6" />
              <path d="M50 85 V99 M42 91 H58 M40 96 Q50 106 60 96" stroke={accent} strokeWidth="3.2" fill="none" strokeLinecap="round" />
            </>
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
      {variant === 9 && (
        <>
          <path d="M22 36 Q50 16 78 36 Q70 24 50 22 Q30 24 22 36 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M22 66 Q50 82 78 66" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M82 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke="#4cc9f0" strokeWidth="1.2" />
        </>
      )}
      {variant === 10 && (
        <>
          <path d="M16 46 Q50 28 84 46 L84 40 Q50 18 16 40 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="26" r="4.5" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
          <path d="M30 66 H70 M34 72 H66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {variant === 11 && (
        <>
          <path d="M26 30 Q50 6 74 30" stroke="#fff3b0" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="19" r="5.5" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <path d="M12 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M86 40 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#fff" stroke="#ffd166" strokeWidth="1.2" />
        </>
      )}
      {variant === 12 && (
        <>
          <path d="M38 26 Q50 6 62 26 Q50 20 38 26 Z" fill="#fff3b0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M20 62 L10 70 M80 62 L90 70" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M84 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 13 && (
        <>
          <path d="M20 36 L50 2 L80 36 Q50 24 20 36 Z" fill={color} stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M20 36 Q50 24 80 36" stroke={accent} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M50 10 l2.2 5 5.2.6 -3.9 3.5 1.1 5.2 -4.6 -2.7 -4.6 2.7 1.1 -5.2 -3.9 -3.5 5.2 -.6z" fill="#ffd166" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        </>
      )}
      {variant === 14 && (
        <>
          <path d="M20 40 Q50 12 80 40 Q68 28 50 26 Q32 28 20 40 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="36" cy="24" r="3.4" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="64" cy="22" r="2.6" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="82" cy="52" r="2.2" fill="#fff" stroke={INK} strokeWidth="1.6" />
        </>
      )}
      {variant === 15 && (
        <>
          <path d="M20 40 Q8 34 10 46 Q14 52 22 48 Z M80 40 Q92 34 90 46 Q86 52 78 48 Z" fill="#fff" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M84 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 16 && (
        <>
          <path d="M18 42 Q50 24 82 42 L82 34 Q50 14 18 34 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M30 66 L36 72 L32 78 M68 66 L64 72 L68 78" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {variant === 17 && (
        <>
          <path d="M36 22 Q38 6 50 0 Q48 12 56 16 Q60 8 64 22 Q50 16 36 22 Z" fill="#ffd23f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M44 20 Q50 8 56 20 Z" fill={color} />
          <path d="M16 56 L8 62 M84 56 L92 62" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {variant === 18 && (
        <>
          <rect x="20" y="40" width="60" height="14" rx="7" fill={accent} opacity="0.9" stroke={INK} strokeWidth="2.6" />
          <path d="M26 47 H74" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="6 5" />
          <circle cx="50" cy="22" r="3.5" fill="#ffd166" stroke={INK} strokeWidth="2" />
        </>
      )}
      {variant === 19 && (
        <>
          <path d="M16 38 Q50 20 84 38 L84 46 Q50 28 16 46 Z" fill={accent} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M84 42 Q96 38 98 52 Q92 46 86 50 Z" fill={accent} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M26 68 Q50 78 74 68" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {variant === 20 && (
        <>
          <path d="M42 30 Q40 14 52 4 Q56 16 58 30 Z" fill="#f1f1f1" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M20 54 L12 60 M80 54 L88 60" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <rect x="24" y="30" width="52" height="7" rx="3.5" fill={accent} stroke={INK} strokeWidth="2.6" />
        </>
      )}
      {variant === 21 && (
        <>
          {[28, 38, 50, 62, 72].map((x, i) => (
            <polygon key={x} points={`${x - 5},30 ${x},${i === 2 ? 6 : 14} ${x + 5},30`} fill={accent} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          ))}
          <circle cx="40" cy="70" r="1.8" fill={INK} />
          <circle cx="60" cy="70" r="1.8" fill={INK} />
        </>
      )}
      {variant === 22 && (
        <>
          <path d="M30 26 Q50 6 70 26 Q50 18 30 26 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="50,12 55,20 50,28 45,20" fill={accent} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M84 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M10 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 23 && (
        <>
          <path d="M22 34 Q50 8 78 34 Q50 24 22 34 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M50 4 l2.4 5.6 5.8.6 -4.3 3.9 1.3 5.8 -5.2 -3 -5.2 3 1.3 -5.8 -4.3 -3.9 5.8 -.6z" fill="#ffd166" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="24" cy="22" r="2.4" fill="#fff" />
          <circle cx="78" cy="16" r="2" fill="#fff" />
          <circle cx="88" cy="44" r="2.2" fill="#fff" />
        </>
      )}
      {variant === 24 && (
        <>
          <polygon points="28,28 32,10 40,22 50,6 60,22 68,10 72,28" fill={accent} stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
          <circle cx="50" cy="22" r="3.4" fill="#fff" stroke={INK} strokeWidth="2" />
          <path d="M84 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 25 && (
        <>
          <path d="M20 40 Q50 22 80 40 L80 48 Q50 30 20 48 Z" fill={accent} opacity="0.9" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M84 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 26 && (
        <>
          <rect x="22" y="40" width="56" height="12" rx="6" fill={INK} opacity="0.85" />
          <circle cx="38" cy="46" r="3" fill={accent} />
          <circle cx="62" cy="46" r="3" fill={accent} />
          <path d="M30 68 H70" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4" />
        </>
      )}
      {variant === 27 && (
        <>
          <path d="M18 34 Q50 4 82 34 L82 28 Q50 -2 18 28 Z" fill="#f8f9fa" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="18" y="30" width="64" height="7" rx="3.5" fill={accent === '#f8f9fa' ? '#1d3557' : '#1d3557'} stroke={INK} strokeWidth="2.4" />
          <circle cx="50" cy="12" r="3.4" fill="#e63946" stroke={INK} strokeWidth="2" />
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
      {variant === 9 && (
        <>
          <polygon points="40,36 52,12 62,34" fill="#fff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="98,34 108,12 120,36" fill="#fff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 10 && (
        <>
          <path d="M6 62 Q-20 50 -16 20 Q4 40 28 50 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M154 62 Q180 50 176 20 Q156 40 132 50 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 11 && (
        <>
          <circle cx="80" cy="56" r="78" fill="#ffd166" opacity="0.18" />
          {[-60, -30, 0, 30, 60].map((a) => (
            <polygon key={a} points="80,56 74,-12 86,-12" fill="#ffb703" stroke={INK} strokeWidth="3" strokeLinejoin="round" transform={`rotate(${a} 80 56)`} />
          ))}
        </>
      )}
      {variant === 12 && (
        <>
          <path d="M8 60 Q-20 62 -24 42 Q-6 44 4 34 Q4 46 30 50 Z" fill="#ff7b54" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M152 60 Q180 62 184 42 Q166 44 156 34 Q156 46 130 50 Z" fill="#ff7b54" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M-8 52 Q-12 50 -14 46 M168 52 Q172 50 174 46" stroke="#ffd93d" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
      {variant === 13 && (
        <>
          <ellipse cx="80" cy="56" rx="86" ry="14" fill="none" stroke={accent} strokeWidth="5" transform="rotate(-12 80 56)" />
          <ellipse cx="80" cy="56" rx="86" ry="14" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.5" transform="rotate(-12 80 56)" />
          <circle cx="-4" cy="64" r="4.5" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
          <circle cx="164" cy="48" r="4.5" fill="#ffd166" stroke={INK} strokeWidth="2.5" />
        </>
      )}
      {variant === 14 && (
        <>
          <path d="M16 70 Q-12 78 -8 100 Q4 92 8 82 Q14 92 24 86 Z" fill={color} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M144 70 Q172 78 168 100 Q156 92 152 82 Q146 92 136 86 Z" fill={color} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="80" cy="66" rx="82" ry="30" fill={accent} opacity="0.18" />
        </>
      )}
      {variant === 15 && (
        <>
          <path d="M10 60 Q-18 56 -20 30 Q4 30 22 48 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M150 60 Q178 56 180 30 Q156 30 138 48 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M-6 76 Q-16 84 -4 92 M166 76 Q176 84 164 92" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {variant === 16 && (
        <>
          <polygon points="14,58 -20,46 -12,70 -22,84 18,76" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="146,58 180,46 172,70 182,84 142,76" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="56,38 66,20 74,32 82,14 92,34 104,24 108,40" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </>
      )}
      {variant === 17 && (
        <>
          <polygon points="46,92 114,92 140,100 20,100" fill="#fff3b0" opacity="0.55" />
          <path d="M14 62 Q-14 62 -16 82 Q10 82 24 72 Z M146 62 Q174 62 176 82 Q150 82 136 72 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 18 && (
        <>
          <path d="M-18 40 Q-26 64 -18 88 M-6 46 Q-12 64 -6 82" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M178 40 Q186 64 178 88 M166 46 Q172 64 166 82" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <line x1="80" y1="14" x2="80" y2="-2" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {variant === 19 && (
        <>
          <path d="M6 66 Q-20 70 -18 96 Q-8 88 -2 98 Q6 86 14 94 Q22 84 30 92 L130 92 Q138 84 146 94 Q154 86 162 98 Q168 88 178 96 Q180 70 154 66 Z" fill="#fff" opacity="0.88" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 20 && (
        <>
          <path d="M12 54 Q-24 40 -18 8 Q-6 30 22 42 Z" fill="#f1f1f1" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M148 54 Q184 40 178 8 Q166 30 138 42 Z" fill="#f1f1f1" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <polygon points="14,62 -26,68 14,76" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 21 && (
        <>
          <path d="M14 66 Q-20 62 -22 90 Q-6 80 10 84 Z M146 66 Q180 62 182 90 Q166 80 150 84 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {[44, 62, 80, 98, 116].map((x, i) => (
            <polygon key={x} points={`${x - 7},36 ${x},${i === 2 ? 4 : 14} ${x + 7},36`} fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          ))}
        </>
      )}
      {variant === 22 && (
        <>
          <ellipse cx="80" cy="56" rx="80" ry="50" fill={accent} opacity="0.14" />
          {[-90, -45, 0, 45].map((a) => (
            <polygon key={a} points="80,56 76,2 84,2" fill="#fff" opacity="0.8" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" transform={`rotate(${a} 80 56)`} />
          ))}
          <polygon points="80,56 76,2 84,2" fill="#fff" opacity="0.8" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" transform="rotate(135 80 56)" />
        </>
      )}
      {variant === 23 && (
        <>
          <ellipse cx="80" cy="56" rx="84" ry="50" fill={accent} opacity="0.16" />
          {[-72, -36, 0, 36, 72, 108, 144, 180, 216, 252].map((a) => (
            <polygon key={a} points="80,56 75,2 85,2" fill={a % 72 === 0 ? '#ffd166' : accent} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" transform={`rotate(${a} 80 56)`} />
          ))}
        </>
      )}
      {variant === 24 && (
        <>
          <path d="M-16 74 Q10 40 40 52 Q60 24 80 36 Q100 24 120 52 Q150 40 176 74" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M-16 74 Q10 40 40 52 Q60 24 80 36 Q100 24 120 52 Q150 40 176 74" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
        </>
      )}
      {variant === 25 && (
        <>
          <path d="M12 56 Q-16 40 -10 22 Q4 26 24 44 Z M148 56 Q176 40 170 22 Q156 26 136 44 Z" fill={accent} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
      {variant === 26 && (
        <>
          <ellipse cx="22" cy="40" rx="30" ry="9" transform="rotate(-18 22 40)" fill="#bdefff" opacity="0.6" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="138" cy="40" rx="30" ry="9" transform="rotate(18 138 40)" fill="#bdefff" opacity="0.6" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="26" cy="58" rx="26" ry="7" transform="rotate(12 26 58)" fill="#bdefff" opacity="0.5" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="134" cy="58" rx="26" ry="7" transform="rotate(-12 134 58)" fill="#bdefff" opacity="0.5" stroke={INK} strokeWidth="3.5" />
        </>
      )}
      {variant === 27 && (
        <>
          <ellipse cx="10" cy="80" rx="12" ry="9" fill={accent} stroke={INK} strokeWidth="4" />
          <ellipse cx="150" cy="80" rx="12" ry="9" fill={accent} stroke={INK} strokeWidth="4" />
          <ellipse cx="46" cy="86" rx="12" ry="9" fill={accent} stroke={INK} strokeWidth="4" />
          <ellipse cx="114" cy="86" rx="12" ry="9" fill={accent} stroke={INK} strokeWidth="4" />
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
      {variant === 9 && (
        <>
          <path d="M10 64 L22 80 L36 70 L50 86 L64 72 L80 88 L96 72 L110 86 L124 70 L138 80 L150 64" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
        </>
      )}
      {variant === 10 && (
        <>
          <path d="M14 56 H146 M24 48 H136" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="64" r="9" fill="#ffd166" stroke={INK} strokeWidth="3" />
        </>
      )}
      {variant === 11 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={accent} strokeWidth="4" />
          <circle cx="80" cy="40" r="30" fill="#0b0b1a" opacity="0.55" />
          <path d="M60 40 A20 20 0 0 1 100 40" stroke="#ffd166" strokeWidth="3" fill="none" />
        </>
      )}
      {variant === 12 && (
        <>
          <path d="M20 64 Q50 52 80 64 Q110 52 140 64" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M70 34 Q80 14 90 34 Q80 28 70 34 Z" fill="#ffd93d" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </>
      )}
      {variant === 13 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="6 5" />
          <path d="M44 62 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M104 70 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#ffd166" stroke={INK} strokeWidth="1.4" />
        </>
      )}
      {variant === 14 && (
        <>
          {[40, 80, 120].map((x) => (
            <circle key={x} cx={x} cy="64" r="7" fill="#0b2545" stroke={accent} strokeWidth="3" />
          ))}
          <path d="M14 84 q8 -8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 15 && (
        <>
          <path d="M16 64 Q44 52 80 64 Q116 76 144 64" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60 30 Q80 8 100 30" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
      {variant === 16 && (
        <>
          <path d="M30 56 L44 68 L36 80 M120 54 L112 68 L124 80" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M70 52 L84 66 L74 78" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </>
      )}
      {variant === 17 && (
        <>
          <rect x="70" y="10" width="20" height="18" rx="4" fill="#ffd23f" stroke={INK} strokeWidth="3.5" />
          <rect x="74" y="14" width="12" height="10" rx="2" fill="#fff3b0" />
          <path d="M70 10 L80 0 L90 10 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </>
      )}
      {variant === 18 && (
        <>
          <circle cx="80" cy="-2" r="6" fill={accent} stroke={INK} strokeWidth="3.5" />
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={accent} strokeWidth="3" />
          <ellipse cx="80" cy="64" rx="52" ry="15" fill="none" stroke={accent} strokeWidth="3" opacity="0.7" />
        </>
      )}
      {variant === 19 && (
        <>
          <circle cx="66" cy="38" r="4" fill={INK} />
          <circle cx="94" cy="38" r="4" fill={INK} />
          <path d="M70 50 Q80 58 90 50" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M20 64 Q50 56 80 64 Q110 72 140 64" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 20 && (
        <>
          <path d="M18 62 H142" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          {[34, 56, 104, 126].map((x) => (
            <circle key={x} cx={x} cy="64" r="3.2" fill="#fff" stroke={INK} strokeWidth="2" />
          ))}
          <path d="M72 30 L80 14 L88 30" stroke="#f1f1f1" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {variant === 21 && (
        <>
          {[26, 50, 74, 98, 122].map((x) => (
            <path key={x} d={`M${x} 72 q8 -14 16 0`} stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          ))}
          <circle cx="62" cy="38" r="3" fill={INK} />
          <circle cx="98" cy="38" r="3" fill={INK} />
        </>
      )}
      {variant === 22 && (
        <>
          <circle cx="80" cy="64" r="11" fill="#fff" stroke={INK} strokeWidth="3" />
          <circle cx="80" cy="64" r="5" fill={accent} />
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="3 6" strokeLinecap="round" />
        </>
      )}
      {variant === 23 && (
        <>
          <ellipse cx="80" cy="64" rx="74" ry="24" fill="none" stroke="#ffd166" strokeWidth="3.5" strokeDasharray="2 5" strokeLinecap="round" />
          <path d="M80 44 l3.4 8 8.6.8 -6.5 5.7 2 8.5 -7.5 -4.5 -7.5 4.5 2 -8.5 -6.5 -5.7 8.6 -.8z" fill="#ffd166" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        </>
      )}
      {variant === 24 && (
        <>
          <path d="M10 62 Q30 50 50 62 T90 62 T130 62 T150 62" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M20 74 Q40 64 60 74 T100 74 T140 74" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M60 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" stroke={accent} strokeWidth="1.2" />
        </>
      )}
      {variant === 25 && (
        <>
          <path d="M80 36 V92" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M44 48 Q40 64 52 80 M116 48 Q120 64 108 80" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M70 26 Q80 6 90 26" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 26 && (
        <>
          <circle cx="62" cy="38" r="5" fill={accent} stroke={INK} strokeWidth="2.5" />
          <circle cx="98" cy="38" r="5" fill={accent} stroke={INK} strokeWidth="2.5" />
          <path d="M80 94 Q90 100 100 96" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === 27 && (
        <>
          {[[44, 62], [80, 56], [116, 62]].map(([x, y]) => (
            <path key={x} d={`M${x - 11} ${y} L${x - 5} ${y - 9} H${x + 5} L${x + 11} ${y} L${x + 5} ${y + 9} H${x - 5} Z`} fill="none" stroke={accent} strokeWidth="3.2" strokeLinejoin="round" />
          ))}
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
