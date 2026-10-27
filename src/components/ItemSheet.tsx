import { useState, type CSSProperties } from 'react';
import { useGame } from '../lib/GameContext';
import { CharacterArt, ShipArt } from './Art';
import { StatBar } from './Ui';
import { MAX_LEVEL, scaled, upgradeCost } from '../game/progress';
import { RARITY_COLOR, RARITY_LABEL, type Character, type Ship } from '../types';
import type { Kind } from './ItemCard';

/** Fiche détaillée d'un personnage ou d'une soucoupe : stats, niveau, choisir / améliorer / débloquer. */
export function ItemSheet({
  kind,
  id,
  onClose,
  onBuy,
  onToast,
}: {
  kind: Kind;
  id: string;
  onClose: () => void;
  onBuy: (kind: Kind, item: Character | Ship) => void;
  onToast: (m: string) => void;
}) {
  const g = useGame();
  const [busy, setBusy] = useState(false);
  const isChars = kind === 'characters';
  const item: Character | Ship | undefined = (isChars ? g.characters : g.ships).find((x) => x.id === id);
  if (!item) return null;

  const owned = isChars ? g.ownedCharacters.has(id) : g.ownedShips.has(id);
  const selected = isChars ? g.character?.id === id : g.ship?.id === id;
  const level = (isChars ? g.characterLevels[id] : g.shipLevels[id]) ?? 1;
  const cost = upgradeCost(level);
  const coins = g.profile?.coins ?? 0;
  const gems = g.profile?.gems ?? 0;
  const style = { '--rarity': RARITY_COLOR[item.rarity] } as CSSProperties;
  const next = level < MAX_LEVEL;

  async function upgrade() {
    setBusy(true);
    const err = isChars ? await g.upgradeCharacter(id) : await g.upgradeShip(id);
    setBusy(false);
    onToast(err ?? `${item!.name} passe au niveau ${level + 1} !`);
  }

  // Une ligne de stat : valeur actuelle, et ce que donnerait le niveau suivant
  const stat = (label: string, base: number, max: number, color: string) => (
    <div className="sheet-stat">
      <StatBar label={label} value={scaled(base, level)} max={max} color={color} />
      {owned && next && <em className="gain">→ {scaled(base, level + 1)}</em>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal sheet" style={style} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        <div className={`sheet-art ${owned ? '' : 'locked'}`}>
          {isChars ? (
            <CharacterArt color={item.color} accent={item.accent} variant={item.sort_order} size={150} />
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
          {stat('Vie', item.hp, 180, '#5bd75b')}
          {stat('Force', item.strength, 15, '#ff9f1c')}
          {stat('Résist.', item.resistance, 14, '#4cc9f0')}
          {!isChars && <StatBar label="Vitesse" value={(item as Ship).speed} max={10} color="#b57bff" />}
        </div>
        {isChars && (
          <p className="attack">
            Attaque : <strong>{(item as Character).attack_type}</strong>
          </p>
        )}

        <div className="card-actions">
          {owned ? (
            <>
              <button
                className={`btn ${selected ? 'btn-green' : 'btn-blue'}`}
                disabled={selected}
                onClick={() => (isChars ? g.selectCharacter(id) : g.selectShip(id))}
              >
                {selected ? '✓ Sélectionné' : 'Choisir'}
              </button>
              {next ? (
                <button className={`btn ${coins >= cost ? 'btn-yellow' : 'btn-grey'}`} disabled={busy} onClick={() => void upgrade()}>
                  Améliorer 🪙 {cost}
                </button>
              ) : (
                <span className="maxed">Niveau max ★</span>
              )}
            </>
          ) : (
            <button
              className={`btn ${gems >= item.price ? 'btn-yellow' : 'btn-grey'}`}
              onClick={() => {
                onClose();
                onBuy(kind, item);
              }}
            >
              Débloquer 💎 {item.price.toLocaleString('fr-FR')}
            </button>
          )}
        </div>
        <p className="legend skins-soon">🎨 Skins : bientôt</p>
      </div>
    </div>
  );
}
