import type { CSSProperties, ReactNode } from 'react';
import { CharacterArt, ShipArt } from './Art';
import { StatBar } from './Ui';
import { RARITY_COLOR, RARITY_LABEL, type Character, type Ship } from '../types';

export type Kind = 'characters' | 'ships';

/** Carte d'un personnage ou d'une soucoupe (utilisée par les collections et par la boutique). */
export function ItemCard({
  kind,
  item,
  owned,
  selected,
  footer,
}: {
  kind: Kind;
  item: Character | Ship;
  owned: boolean;
  selected?: boolean;
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
      <span className="rarity">{RARITY_LABEL[item.rarity]}</span>

      <div className="stats">
        <StatBar label="Vie" value={item.hp} max={180} color="#5bd75b" />
        <StatBar label="Force" value={item.strength} max={15} color="#ff9f1c" />
        <StatBar label="Résist." value={item.resistance} max={14} color="#4cc9f0" />
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
