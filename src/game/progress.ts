// Niveaux des personnages et des soucoupes (1 à 10).
// Les pièces servent à améliorer. Les gemmes servent à acheter de nouveaux personnages et soucoupes.
// Ces valeurs doivent rester identiques à celles de la base (fonctions upgrade_character / upgrade_ship).

export const MAX_LEVEL = 10;

/** Chaque niveau ajoute 8 % aux statistiques de base. */
export function levelMult(level: number): number {
  return 1 + 0.08 * (Math.max(1, level) - 1);
}

/** Pièces à payer pour passer de `level` à `level + 1`. */
export function upgradeCost(level: number): number {
  return 60 * level;
}

/** Statistique de base multipliée selon le niveau (arrondie). */
export function scaled(base: number, level: number): number {
  return Math.round(base * levelMult(level));
}

// Gemmes gagnées (pour l'affichage ; le calcul réel est fait par la base de données)
export const GEMS_FIRST_CLEAR = 0; // les niveaux normaux ne donnent plus de gemmes
export const GEMS_BOSS_FIRST_CLEAR = 15;
export const GEMS_DAILY = 1;
export const COINS_DAILY = 30;
