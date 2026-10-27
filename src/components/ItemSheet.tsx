import { useState, type CSSProperties } from 'react';
import { ConfirmModal } from './Ui';
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
  const [previewSkin, setPreviewSkin] = useState<string | null>(null); // skin regardé (null = de base)
  const [skinBuy, setSkinBuy] = useState(false);
  const [skinError, setSkinError] = useState<string | null>(null);
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

  // Skins du personnage
  const charSkins = isChars ? g.skins.filter((s) => s.character_id === id) : [];
  const equippedId = isChars ? g.equippedSkin[id] ?? null : null;
  const shownSkin = charSkins.find((s) => s.id === previewSkin) ?? null;
  const art = shownSkin ?? item; // couleurs affichées (skin regardé ou de base)
  const artLook = shownSkin ? shownSkin.style : null;
  const skinOwned = !!shownSkin && g.ownedSkins.has(shownSkin.id);

  async function equip(skinId: string | null) {
    setBusy(true);
    const err = await g.equipSkin(id, skinId);
    setBusy(false);
    onToast(err ?? (skinId ? 'Skin équipé !' : 'Skin de base équipé'));
  }
  async function buySkin() {
    if (!shownSkin) return;
    setBusy(true);
    setSkinError(null);
    const err = await g.buySkin(shownSkin.id);
    if (err) {
      setBusy(false);
      setSkinError(err);
      return;
    }
    const err2 = await g.equipSkin(id, shownSkin.id);
    setBusy(false);
    setSkinBuy(false);
    onToast(err2 ?? `${shownSkin.name} débloqué et équipé !`);
  }

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
            <CharacterArt color={art.color} accent={art.accent} variant={item.sort_order} look={artLook} size={150} />
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
        {isChars && owned && charSkins.length > 0 && (
          <div className="skins">
            <h3 className="skins-title">🎨 Skins</h3>
            <div className="skin-row">
              <button
                className={`skin-chip ${previewSkin === null ? 'on' : ''}`}
                onClick={() => setPreviewSkin(null)}
              >
                <span className="swatch" style={{ background: item.color, borderColor: item.accent }} />
                <span>Base</span>
                {equippedId === null && <em>✓</em>}
              </button>
              {charSkins.map((s) => (
                <button
                  key={s.id}
                  className={`skin-chip ${previewSkin === s.id ? 'on' : ''}`}
                  onClick={() => setPreviewSkin(s.id)}
                >
                  <span className="swatch" style={{ background: s.color, borderColor: s.accent }} />
                  <span>{s.name}</span>
                  {equippedId === s.id ? <em>✓</em> : !g.ownedSkins.has(s.id) && <em>💎{s.price}</em>}
                </button>
              ))}
            </div>
            {previewSkin === null ? (
              <button className="btn btn-small btn-green" disabled={busy || equippedId === null} onClick={() => void equip(null)}>
                {equippedId === null ? '✓ Équipé' : 'Équiper le skin de base'}
              </button>
            ) : skinOwned ? (
              <button className="btn btn-small btn-green" disabled={busy || equippedId === previewSkin} onClick={() => void equip(previewSkin)}>
                {equippedId === previewSkin ? '✓ Équipé' : 'Équiper'}
              </button>
            ) : (
              <button
                className={`btn btn-small ${gems >= (shownSkin?.price ?? 0) ? 'btn-yellow' : 'btn-grey'}`}
                onClick={() => {
                  setSkinError(null);
                  setSkinBuy(true);
                }}
              >
                Débloquer 💎 {shownSkin?.price}
              </button>
            )}
          </div>
        )}
        {skinBuy && shownSkin && (
          <ConfirmModal
            title="Débloquer le skin ?"
            confirmLabel={`💎 ${shownSkin.price}`}
            confirmDisabled={gems < shownSkin.price}
            busy={busy}
            error={skinError}
            onConfirm={() => void buySkin()}
            onClose={() => setSkinBuy(false)}
          >
            <p>
              <strong>
                {item.name} {shownSkin.name}
              </strong>{' '}
              pour 💎 {shownSkin.price} gemmes.
            </p>
            {gems < shownSkin.price ? (
              <p>Il te manque 💎 {shownSkin.price - gems} gemmes.</p>
            ) : (
              <p>Il te restera 💎 {gems - shownSkin.price} gemmes.</p>
            )}
          </ConfirmModal>
        )}
      </div>
    </div>
  );
}
