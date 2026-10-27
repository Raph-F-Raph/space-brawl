import type { CSSProperties } from 'react';
import { CharacterArt, ShipArt } from './Art';
import { MAX_LEVEL } from '../game/progress';
import { RARITY_COLOR, type Character, type Ship } from '../types';
import type { Kind } from './ItemCard';

/** Petite vignette cliquable : on touche pour ouvrir la fiche détaillée. */
export function ItemTile({
  kind,
  item,
  owned,
  selected,
  level = 1,
  onOpen,
}: {
  kind: Kind;
  item: Character | Ship;
  owned: boolean;
  selected?: boolean;
  level?: number;
  onOpen: () => void;
}) {
  const isChars = kind === 'characters';
  const style = { '--rarity': RARITY_COLOR[item.rarity] } as CSSProperties;
  return (
    <button className={`tile ${selected ? 'selected' : ''} ${owned ? '' : 'locked'}`} style={style} onClick={onOpen}>
      <div className="tile-art">
        {isChars ? (
          <CharacterArt color={item.color} accent={item.accent} variant={item.sort_order} look={(item as Character).style} size={64} />
        ) : (
          <ShipArt color={item.color} accent={item.accent} variant={item.sort_order} size={92} />
        )}
        {!owned && <span className="tile-lock">🔒</span>}
      </div>
      <span className="tile-name">{item.name}</span>
      {owned ? (
        <span className="tile-sub">{selected ? '✓ ' : ''}Niv. {level}/{MAX_LEVEL}</span>
      ) : (
        <span className="tile-sub tile-price">💎 {item.price.toLocaleString('fr-FR')}</span>
      )}
    </button>
  );
}
