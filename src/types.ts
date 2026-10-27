export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AttackKind = 'laser' | 'burst' | 'pierce' | 'shockwave';

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
  | 'settings';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#8d99ae',
  rare: '#4cc9f0',
  epic: '#b57bff',
  legendary: '#ffb703',
};
