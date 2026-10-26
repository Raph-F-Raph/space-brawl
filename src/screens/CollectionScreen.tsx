import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemTile, type Kind } from '../components/ItemCard';
import { ItemDetail } from '../components/ItemDetail';
import { TopBar } from '../components/Ui';
import type { Character, Ship } from '../types';

export function CollectionScreen({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const isChars = kind === 'characters';
  const items: (Character | Ship)[] = isChars ? g.characters : g.ships;
  const coins = g.profile?.coins ?? 0;
  const gems = g.profile?.gems ?? 0;

  const opened = items.find((i) => i.id === openId) ?? null;
  const openedOwned = opened ? (isChars ? g.ownedCharacters.has(opened.id) : g.ownedShips.has(opened.id)) : false;
  const openedLevel = opened ? ((isChars ? g.characterLevels[opened.id] : g.shipLevels[opened.id]) ?? 1) : 1;

  async function upgrade(it: Character | Ship, level: number) {
    setBusyId(it.id);
    const err = isChars ? await g.upgradeCharacter(it.id) : await g.upgradeShip(it.id);
    setBusyId(null);
    buy.showToast(err ?? `${it.name} passe au niveau ${level + 1} !`);
  }

  return (
    <div className="screen">
      <TopBar title={isChars ? 'Personnages' : 'Soucoupes'} onBack={onBack} />

      <div className="scroll">
        <div className="tiles">
          {items.map((it) => {
            const owned = isChars ? g.ownedCharacters.has(it.id) : g.ownedShips.has(it.id);
            const selected = isChars ? g.character?.id === it.id : g.ship?.id === it.id;
            const level = (isChars ? g.characterLevels[it.id] : g.shipLevels[it.id]) ?? 1;
            return (
              <ItemTile
                key={it.id}
                kind={kind}
                item={it}
                owned={owned}
                selected={selected}
                level={level}
                onOpen={() => setOpenId(it.id)}
              />
            );
          })}
        </div>
        <p className="legend">
          <strong>Vie</strong> : points de vie · <strong>Force</strong> : dégâts infligés ·{' '}
          <strong>Résistance</strong> : réduit les dégâts reçus
          {!isChars && (
            <>
              {' '}
              · <strong>Vitesse</strong> : rapidité de déplacement
            </>
          )}
          . Le personnage et la soucoupe s'additionnent ! Chaque niveau ajoute 8 % aux statistiques. Les pièces
          servent à améliorer, les gemmes à débloquer de nouveaux pilotes et soucoupes.
        </p>
      </div>

      {opened && (
        <ItemDetail
          kind={kind}
          item={opened}
          owned={openedOwned}
          selected={isChars ? g.character?.id === opened.id : g.ship?.id === opened.id}
          level={openedLevel}
          coins={coins}
          gems={gems}
          busy={busyId === opened.id}
          onClose={() => setOpenId(null)}
          onSelect={() => (isChars ? g.selectCharacter(opened.id) : g.selectShip(opened.id))}
          onUpgrade={() => void upgrade(opened, openedLevel)}
          onBuy={() => buy.askBuy(kind, opened)}
        />
      )}
      {buy.ui}
    </div>
  );
}
