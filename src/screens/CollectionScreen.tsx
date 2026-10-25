import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemCard, type Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
import type { Character, Ship } from '../types';

export function CollectionScreen({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const isChars = kind === 'characters';
  const items: (Character | Ship)[] = isChars ? g.characters : g.ships;
  const coins = g.profile?.coins ?? 0;

  return (
    <div className="screen">
      <TopBar title={isChars ? 'Personnages' : 'Soucoupes'} onBack={onBack} />

      <div className="scroll">
        <div className="grid">
          {items.map((it) => {
            const owned = isChars ? g.ownedCharacters.has(it.id) : g.ownedShips.has(it.id);
            const selected = isChars ? g.character?.id === it.id : g.ship?.id === it.id;
            return (
              <ItemCard
                key={it.id}
                kind={kind}
                item={it}
                owned={owned}
                selected={selected}
                footer={
                  owned ? (
                    <button
                      className={`btn btn-small ${selected ? 'btn-green' : 'btn-blue'}`}
                      disabled={selected}
                      onClick={() => (isChars ? g.selectCharacter(it.id) : g.selectShip(it.id))}
                    >
                      {selected ? '✓ Sélectionné' : 'Choisir'}
                    </button>
                  ) : (
                    <button
                      className={`btn btn-small ${coins >= it.price ? 'btn-yellow' : 'btn-grey'}`}
                      onClick={() => buy.askBuy(kind, it)}
                    >
                      🪙 {it.price.toLocaleString('fr-FR')}
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
          . Le personnage et la soucoupe s'additionnent !
        </p>
      </div>

      {buy.ui}
    </div>
  );
}
