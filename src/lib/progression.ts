import type { Character, Ship } from '../types';

// Règles d'économie. Les mêmes chiffres existent côté serveur (supabase/schema.sql) : si tu en changes un, change-le aux deux endroits.
export const MAX_LEVEL = 10;
export const COINS_PER_GEM = 10; // 1 gemme = 10 pièces (fonction SQL exchange_gems)

/** Prix en pièces pour passer du niveau `level` au niveau suivant. */
export function upgradeCost(level: number): number {
  return 50 * level;
}

/** Gemmes gagnées la première fois qu'on termine un niveau (10 pour le méga boss). */
export function gemsForFirstClear(level: number): number {
  return level === 5 ? 10 : 2;
}

/** +10 % de vie et de force par niveau. La résistance ne change pas (sinon on deviendrait invincible). */
export function levelMultiplier(level: number): number {
  return 1 + 0.1 * (Math.max(1, level) - 1);
}

export function withLevel<T extends Character | Ship>(item: T, level: number): T {
  const m = levelMultiplier(level);
  return { ...item, hp: Math.round(item.hp * m), strength: Math.round(item.strength * m) };
}
