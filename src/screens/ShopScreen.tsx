import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { ItemSheet } from '../components/ItemSheet';
import { ItemTile } from '../components/ItemTile';
import type { Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
import { COINS_DAILY, GEMS_BOSS_FIRST_CLEAR, GEMS_DAILY, GEMS_FIRST_CLEAR } from '../game/progress';

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<{ kind: Kind; id: string } | null>(null);

  const gems = g.profile?.gems ?? 0;
  const lockedChars = g.characters.filter((c) => !g.ownedCharacters.has(c.id));
  const lockedShips = g.ships.filter((s) => !g.ownedShips.has(s.id));

  // Le cadeau se renouvelle chaque jour à minuit (heure UTC, comme dans la base de données)
  const todayUtc = new Date().toISOString().slice(0, 10);
  const giftTaken = g.profile?.last_daily === todayUtc;

  async function claim() {
    setBusy(true);
    const err = await g.claimDailyGift();
    setBusy(false);
    buy.showToast(err ?? `Cadeau reçu : +${GEMS_DAILY} 💎 et +${COINS_DAILY} 🪙`);
  }

  return (
    <div className="screen">
      <TopBar title="Boutique" onBack={onBack} />

      <div className="scroll">
        <section className="chapter">
          <h2 className="chapter-title">
            Cadeau <span>du jour</span>
          </h2>
          <p className="legend shop-note">
            Chaque jour : {GEMS_DAILY} 💎 et {COINS_DAILY} 🪙 offerts.
          </p>
          <div className="exchange">
            <button className="btn btn-yellow" disabled={busy || giftTaken} onClick={() => void claim()}>
              {giftTaken ? 'Reviens demain !' : `🎁 Récupérer`}
            </button>
          </div>
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Personnages <span>à débloquer</span>
          </h2>
          {lockedChars.length === 0 ? (
            <p className="legend">Tu as débloqué tous les personnages. Bravo, pilote !</p>
          ) : (
            <div className="tiles">
              {lockedChars.map((c) => (
                <ItemTile key={c.id} kind="characters" item={c} owned={false} onOpen={() => setOpen({ kind: 'characters', id: c.id })} />
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
            <div className="tiles">
              {lockedShips.map((c) => (
                <ItemTile key={c.id} kind="ships" item={c} owned={false} onOpen={() => setOpen({ kind: 'ships', id: c.id })} />
              ))}
            </div>
          )}
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Gagner <span>des gemmes</span>
          </h2>
          <ul className="earn">
            <li>
              <strong>+{GEMS_FIRST_CLEAR} 💎</strong> la première fois que tu réussis un niveau
            </li>
            <li>
              <strong>+{GEMS_BOSS_FIRST_CLEAR} 💎</strong> la première fois que tu bats un méga boss
            </li>
            <li>
              <strong>+{GEMS_DAILY} 💎</strong> chaque jour avec le cadeau du jour
            </li>
          </ul>
          <p className="legend">Les pièces 🪙 servent à améliorer tes personnages et soucoupes (écrans Personnages et Soucoupes).</p>
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

      {open && (
        <ItemSheet kind={open.kind} id={open.id} onClose={() => setOpen(null)} onBuy={buy.askBuy} onToast={buy.showToast} />
      )}
      {buy.ui}
    </div>
  );
}
