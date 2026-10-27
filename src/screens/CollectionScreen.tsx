import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemSheet } from '../components/ItemSheet';
import { ItemTile } from '../components/ItemTile';
import type { Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
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
        <div className="tiles">
          {items.map((it) => (
            <ItemTile
              key={it.id}
              kind={kind}
              item={it}
              owned={isChars ? g.ownedCharacters.has(it.id) : g.ownedShips.has(it.id)}
              selected={isChars ? g.character?.id === it.id : g.ship?.id === it.id}
              level={(isChars ? g.characterLevels[it.id] : g.shipLevels[it.id]) ?? 1}
              onOpen={() => setOpenId(it.id)}
            />
          ))}
        </div>
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
