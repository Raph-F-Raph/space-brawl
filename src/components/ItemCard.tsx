import type { CSSProperties, ReactNode } from 'react';
import { CharacterArt, ShipArt } from './Art';
import { StatBar } from './Ui';
import { MAX_LEVEL, scaled } from '../game/progress';
import { RARITY_COLOR, RARITY_LABEL, type Character, type Ship } from '../types';

export type Kind = 'characters' | 'ships';

/** Carte d'un personnage ou d'une soucoupe (utilisée par les collections et par la boutique). */
export function ItemCard({
  kind,
  item,
  owned,
  selected,
  level = 1,
  footer,
}: {
  kind: Kind;
  item: Character | Ship;
  owned: boolean;
  selected?: boolean;
  level?: number; // niveau actuel (1 à 10) : les statistiques affichées en tiennent compte
  footer: ReactNode;
}) {
  const isChars = kind === 'characters';
  const style = { '--rarity': RARITY_COLOR[item.rarity] } as CSSProperties;
  return (
    <article className={`card ${selected ? 'selected' : ''} ${owned ? '' : 'locked'}`} style={style}>
      <div className="card-art">
        {isChars ? (
          <CharacterArt color={item.color} accent={item.accent} variant={item.sort_order} size={104} />
        ) : (
          <ShipArt color={item.color} accent={item.accent} variant={item.sort_order} size={180} />
        )}
        {!owned && <div className="lock">🔒</div>}
      </div>
      <h2 className="card-name">{item.name}</h2>
      <div className="card-tags">
        <span className="rarity">{RARITY_LABEL[item.rarity]}</span>
        {owned && (
          <span className="level-pill">
            Niv. {level}/{MAX_LEVEL}
          </span>
        )}
      </div>

      <div className="stats">
        <StatBar label="Vie" value={scaled(item.hp, level)} max={180} color="#5bd75b" />
        <StatBar label="Force" value={scaled(item.strength, level)} max={15} color="#ff9f1c" />
        <StatBar label="Résist." value={scaled(item.resistance, level)} max={14} color="#4cc9f0" />
        {!isChars && <StatBar label="Vitesse" value={(item as Ship).speed} max={10} color="#b57bff" />}
      </div>
      {isChars && (
        <p className="attack">
          Attaque : <strong>{(item as Character).attack_type}</strong>
        </p>
      )}

      {footer}
    </article>
  );
}
