import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemSheet } from '../components/ItemSheet';
import { ItemTile } from '../components/ItemTile';
import type { Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
import { RARITY_COLOR, RARITY_LABEL, RARITY_ORDER, byRarity } from '../types';
import type { Character, Ship } from '../types';

export function CollectionScreen({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [openId, setOpenId] = useState<string | null>(null);
  const isChars = kind === 'characters';
  const items: (Character | Ship)[] = isChars ? g.characters : g.ships;

  return (
    <div className="screen">
      <TopBar title={isChars ? 'Personnages' : 'Soucoupes'} onBack={onBack} />

      <div className="scroll">
        {RARITY_ORDER.map((r) => {
          const group = byRarity(items).filter((it) => it.rarity === r);
          if (group.length === 0) return null;
          return (
            <section key={r} className="rarity-group">
              <h3 className="rarity-title" style={{ color: RARITY_COLOR[r] }}>
                {RARITY_LABEL[r]}
                {!isChars || group[0].price > 0 ? <span> · {group[0].price + 0} 💎</span> : null}
              </h3>
        <div className="tiles">
          {group.map((it) => (
            <ItemTile
              key={it.id}
              kind={kind}
              item={isChars ? g.withSkin(it as Character) : it}
              owned={isChars ? g.ownedCharacters.has(it.id) : g.ownedShips.has(it.id)}
              selected={isChars ? g.character?.id === it.id : g.ship?.id === it.id}
              level={(isChars ? g.characterLevels[it.id] : g.shipLevels[it.id]) ?? 1}
              onOpen={() => setOpenId(it.id)}
            />
          ))}
        </div>
            </section>
          );
        })}
        <p className="legend">
          Touche une vignette pour voir les détails et l'améliorer. Le personnage et la soucoupe s'additionnent !
          Chaque niveau ajoute 8 % aux statistiques. Pièces 🪙 = améliorer, gemmes 💎 = débloquer.
        </p>
      </div>

      {openId && (
        <ItemSheet kind={kind} id={openId} onClose={() => setOpenId(null)} onBuy={buy.askBuy} onToast={buy.showToast} />
      )}
      {buy.ui}
    </div>
  );
}
