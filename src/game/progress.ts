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

/** Coût de réparation d'une soucoupe cassée (doit rester identique à ship_repair_cost en base). */
export const REPAIR_COST: Record<string, number> = { common: 0, rare: 60, super_rare: 100, epic: 150, mythic: 200, legendary: 250 };

/** Route des trophées (doit rester identique à claim_trophy_reward en base). */
export const TROPHY_ROAD: { need: number; coins: number; gems: number }[] = [
  { need: 10, coins: 100, gems: 0 },
  { need: 30, coins: 0, gems: 3 },
  { need: 60, coins: 200, gems: 0 },
  { need: 100, coins: 0, gems: 5 },
  { need: 150, coins: 400, gems: 0 },
  { need: 220, coins: 0, gems: 8 },
  { need: 300, coins: 700, gems: 0 },
  { need: 400, coins: 0, gems: 12 },
  { need: 500, coins: 1000, gems: 0 },
  { need: 650, coins: 0, gems: 25 },
];

// Gemmes gagnées (pour l'affichage ; le calcul réel est fait par la base de données)
export const GEMS_FIRST_CLEAR = 0; // les niveaux normaux ne donnent plus de gemmes
export const GEMS_BOSS_FIRST_CLEAR = 15;
export const GEMS_DAILY = 1;
export const COINS_DAILY = 30;
