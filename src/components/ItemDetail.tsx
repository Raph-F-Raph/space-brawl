import type { CSSProperties } from 'react';
import { CharacterArt, ShipArt } from './Art';
import { StatBar } from './Ui';
import type { Kind } from './ItemCard';
import { MAX_LEVEL, scaled, upgradeCost } from '../game/progress';
import { RARITY_COLOR, RARITY_LABEL, type Character, type Ship } from '../types';

/** Fiche détaillée (s'ouvre quand on touche une vignette) : grand dessin, statistiques, amélioration, skins. */
export function ItemDetail({
  kind,
  item,
  owned,
  selected,
  level,
  coins,
  gems,
  busy,
  onClose,
  onSelect,
  onUpgrade,
  onBuy,
}: {
  kind: Kind;
  item: Character | Ship;
  owned: boolean;
  selected: boolean;
  level: number;
  coins: number;
  gems: number;
  busy: boolean;
  onClose: () => void;
  onSelect: () => void;
  onUpgrade: () => void;
  onBuy: () => void;
}) {
  const isChars = kind === 'characters';
  const style = { '--rarity': RARITY_COLOR[item.rarity] } as CSSProperties;
  const cost = upgradeCost(level);
  const maxed = level >= MAX_LEVEL;
  const nx = (v: number) => (owned && !maxed ? scaled(v, level + 1) : undefined);
  return (
    <div className="modal-overlay sheet-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" style={style} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        <div className={`sheet-art ${owned ? '' : 'locked'}`}>
          {isChars ? (
            <CharacterArt color={item.color} accent={item.accent} variant={item.sort_order} size={140} />
          ) : (
            <ShipArt color={item.color} accent={item.accent} variant={item.sort_order} size={230} />
          )}
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
          <StatBar label="Vie" value={scaled(item.hp, level)} next={nx(item.hp)} max={180} color="#5bd75b" />
          <StatBar label="Force" value={scaled(item.strength, level)} next={nx(item.strength)} max={15} color="#ff9f1c" />
          <StatBar label="Résist." value={scaled(item.resistance, level)} next={nx(item.resistance)} max={14} color="#4cc9f0" />
          {!isChars && <StatBar label="Vitesse" value={(item as Ship).speed} max={10} color="#b57bff" />}
        </div>
        {isChars && (
          <p className="attack">
            Attaque : <strong>{(item as Character).attack_type}</strong>
          </p>
        )}

        <div className="sheet-actions">
          {owned ? (
            <>
              <button className={`btn ${selected ? 'btn-green' : 'btn-blue'}`} disabled={selected} onClick={onSelect}>
                {selected ? '✓ Sélectionné' : 'Choisir'}
              </button>
              {maxed ? (
                <span className="maxed">Niveau max ★</span>
              ) : (
                <button className={`btn ${coins >= cost ? 'btn-yellow' : 'btn-grey'}`} disabled={busy} onClick={onUpgrade}>
                  Améliorer 🪙 {cost}
                </button>
              )}
            </>
          ) : (
            <button className={`btn ${gems >= item.price ? 'btn-yellow' : 'btn-grey'}`} onClick={onBuy}>
              Débloquer 💎 {item.price.toLocaleString('fr-FR')}
            </button>
          )}
        </div>

        <div className="skins">
          <span className="skins-title">Skins</span>
          <div className="skins-row">
            <span className="skin-slot on">Classique</span>
            <span className="skin-slot">🔒</span>
            <span className="skin-slot">🔒</span>
          </div>
          <span className="skins-soon">Bientôt : de nouveaux looks pour {item.name} !</span>
        </div>
      </div>
    </div>
  );
}
