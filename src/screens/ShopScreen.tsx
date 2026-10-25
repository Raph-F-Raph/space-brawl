import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemCard } from '../components/ItemCard';
import { TopBar } from '../components/Ui';

// 1 gemme = 20 pièces (même valeur que dans la fonction SQL exchange_gems)
const COINS_PER_GEM = 20;
const EXCHANGES = [1, 5, 10];

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busy, setBusy] = useState(false);

  const coins = g.profile?.coins ?? 0;
  const gems = g.profile?.gems ?? 0;
  const lockedChars = g.characters.filter((c) => !g.ownedCharacters.has(c.id));
  const lockedShips = g.ships.filter((s) => !g.ownedShips.has(s.id));

  async function exchange(n: number) {
    setBusy(true);
    const err = await g.exchangeGems(n);
    setBusy(false);
    buy.showToast(err ?? `+ 🪙 ${(n * COINS_PER_GEM).toLocaleString('fr-FR')} pièces`);
  }

  return (
    <div className="screen">
      <TopBar title="Boutique" onBack={onBack} />

      <div className="scroll">
        <section className="chapter">
          <h2 className="chapter-title">
            Personnages <span>à débloquer</span>
          </h2>
          {lockedChars.length === 0 ? (
            <p className="legend">Tu as débloqué tous les personnages. Bravo, pilote !</p>
          ) : (
            <div className="grid">
              {lockedChars.map((c) => (
                <ItemCard
                  key={c.id}
                  kind="characters"
                  item={c}
                  owned={false}
                  footer={
                    <button
                      className={`btn btn-small ${coins >= c.price ? 'btn-yellow' : 'btn-grey'}`}
                      onClick={() => buy.askBuy('characters', c)}
                    >
                      🪙 {c.price.toLocaleString('fr-FR')}
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Soucoupes <span>à débloquer</span>
          </h2>
          {lockedShips.length === 0 ? (
            <p className="legend">Tu as débloqué toutes les soucoupes. Quelle flotte !</p>
          ) : (
            <div className="grid">
              {lockedShips.map((s) => (
                <ItemCard
                  key={s.id}
                  kind="ships"
                  item={s}
                  owned={false}
                  footer={
                    <button
                      className={`btn btn-small ${coins >= s.price ? 'btn-yellow' : 'btn-grey'}`}
                      onClick={() => buy.askBuy('ships', s)}
                    >
                      🪙 {s.price.toLocaleString('fr-FR')}
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Échange <span>gemmes → pièces</span>
          </h2>
          <p className="legend shop-note">1 💎 = {COINS_PER_GEM} 🪙. Tu gagnes 5 💎 en battant un méga boss pour la première fois.</p>
          <div className="exchange">
            {EXCHANGES.map((n) => (
              <button
                key={n}
                className="btn btn-small btn-blue"
                disabled={busy || gems < n}
                onClick={() => void exchange(n)}
              >
                {n} 💎 → {(n * COINS_PER_GEM).toLocaleString('fr-FR')} 🪙
              </button>
            ))}
          </div>
        </section>

        <section className="chapter chapter-locked">
          <h2 className="chapter-title">
            Packs <span>bientôt</span>
          </h2>
          <div className="packs">
            <div className="pack" aria-disabled="true">
              <span className="pack-icon">💎</span>
              <strong>Pochette de gemmes</strong>
              <span className="badge">Bientôt</span>
            </div>
            <div className="pack" aria-disabled="true">
              <span className="pack-icon">🪙</span>
              <strong>Coffre de pièces</strong>
              <span className="badge">Bientôt</span>
            </div>
          </div>
          <p className="legend">Les achats avec de l'argent réel ne sont pas encore disponibles.</p>
        </section>
      </div>

      {buy.ui}
    </div>
  );
}
