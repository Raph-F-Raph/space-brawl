import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemCard, type Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
import { MAX_LEVEL, upgradeCost } from '../game/progress';
import type { Character, Ship } from '../types';

export function CollectionScreen({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busyId, setBusyId] = useState<string | null>(null);
  const isChars = kind === 'characters';
  const items: (Character | Ship)[] = isChars ? g.characters : g.ships;
  const coins = g.profile?.coins ?? 0;
  const gems = g.profile?.gems ?? 0;

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
        <div className="grid">
          {items.map((it) => {
            const owned = isChars ? g.ownedCharacters.has(it.id) : g.ownedShips.has(it.id);
            const selected = isChars ? g.character?.id === it.id : g.ship?.id === it.id;
            const level = (isChars ? g.characterLevels[it.id] : g.shipLevels[it.id]) ?? 1;
            const cost = upgradeCost(level);
            return (
              <ItemCard
                key={it.id}
                kind={kind}
                item={it}
                owned={owned}
                selected={selected}
                level={level}
                footer={
                  owned ? (
                    <div className="card-actions">
                      <button
                        className={`btn btn-small ${selected ? 'btn-green' : 'btn-blue'}`}
                        disabled={selected}
                        onClick={() => (isChars ? g.selectCharacter(it.id) : g.selectShip(it.id))}
                      >
                        {selected ? '✓ Sélectionné' : 'Choisir'}
                      </button>
                      {level < MAX_LEVEL ? (
                        <button
                          className={`btn btn-small ${coins >= cost ? 'btn-yellow' : 'btn-grey'}`}
                          disabled={busyId === it.id}
                          onClick={() => void upgrade(it, level)}
                        >
                          Améliorer 🪙 {cost}
                        </button>
                      ) : (
                        <span className="maxed">Niveau max ★</span>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`btn btn-small ${gems >= it.price ? 'btn-yellow' : 'btn-grey'}`}
                      onClick={() => buy.askBuy(kind, it)}
                    >
                      💎 {it.price.toLocaleString('fr-FR')}
                    </button>
                  )
                }
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

      {buy.ui}
    </div>
  );
}
