export type Rarity = 'common' | 'rare' | 'super_rare' | 'epic' | 'mythic' | 'legendary';
export type AttackKind = 'laser' | 'burst' | 'pierce' | 'shockwave' | 'spread';

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  hp: number;
  strength: number;
  resistance: number;
  attack_type: string;
  attack_kind: AttackKind;
  color: string;
  accent: string;
  price: number; // en GEMMES (0 = personnage de départ)
  sort_order: number;
  style?: string | null; // accessoire du skin équipé (couronne, bandana…)
}

export interface Bundle {
  id: string;
  name: string;
  character_id: string;
  ship_id: string;
  price: number; // en GEMMES
  sort_order: number;
}

export interface Skin {
  id: string;
  character_id: string;
  name: string;
  price: number; // en GEMMES
  color: string;
  accent: string;
  style: string | null;
  sort_order: number;
}

export interface Ship {
  id: string;
  name: string;
  rarity: Rarity;
  hp: number;
  strength: number;
  resistance: number;
  speed: number;
  color: string;
  accent: string;
  price: number;
  sort_order: number;
}

export interface Profile {
  id: string;
  username: string;
  coins: number;
  gems: number;
  selected_character: string | null;
  selected_ship: string | null;
  last_daily: string | null; // date (AAAA-MM-JJ) du dernier cadeau du jour
}

export interface Progress {
  chapter: number;
  cleared_level: number;
}

export type Screen =
  | 'home'
  | 'characters'
  | 'ships'
  | 'shop'
  | 'clans'
  | 'play'
  | 'chapters'
  | 'level'
  | 'arena'
  | 'settings';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  super_rare: 'Super Rare',
  epic: 'Épique',
  mythic: 'Mythique',
  legendary: 'Légendaire',
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#8d99ae',
  rare: '#4cc9f0',
  super_rare: '#4ade80',
  epic: '#b57bff',
  mythic: '#ff4d6d',
  legendary: '#ffb703',
};

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'super_rare', 'epic', 'mythic', 'legendary'];

/** Trie du plus commun au plus légendaire. */
export function byRarity<T extends { rarity: Rarity; sort_order: number }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) || a.sort_order - b.sort_order,
  );
}
