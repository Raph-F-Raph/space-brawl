import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { CharacterArt, ShipArt } from '../components/Art';
import { ItemSheet } from '../components/ItemSheet';
import { sfx } from '../lib/audio';
import { byRarity, RARITY_COLOR, RARITY_LABEL, RARITY_ORDER } from '../types';
import { ItemTile } from '../components/ItemTile';
import type { Kind } from '../components/ItemCard';
import { TopBar } from '../components/Ui';
import { COINS_DAILY, GEMS_BOSS_FIRST_CLEAR, GEMS_DAILY } from '../game/progress';

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<{ kind: Kind; id: string } | null>(null);

  const gems = g.profile?.gems ?? 0;
  const lockedChars = byRarity(g.characters.filter((c) => !g.ownedCharacters.has(c.id)));
  const lockedShips = byRarity(g.ships.filter((s) => !g.ownedShips.has(s.id)));

  // Le cadeau se renouvelle chaque jour à minuit (heure UTC, comme dans la base de données)
  const todayUtc = new Date().toISOString().slice(0, 10);
  const giftTaken = g.profile?.last_daily === todayUtc;

  // Packs duo : personnage + soucoupe assortie, proposés tant qu'on n'en possède aucun des deux
  const packs = g.bundles.filter((b) => !g.ownedCharacters.has(b.character_id) && !g.ownedShips.has(b.ship_id));
  const [packBusy, setPackBusy] = useState<string | null>(null);
  async function buyPack(id: string, name: string) {
    setPackBusy(id);
    const err = await g.buyBundle(id);
    setPackBusy(null);
    if (!err) sfx('buy');
    buy.showToast(err ?? `${name} débloqué !`);
  }

  const MISSIONS = [
    { label: 'Joue 3 niveaux', value: g.missions.played, goal: 3, reward: '+100 🪙' },
    { label: 'Gagne 2 niveaux', value: g.missions.won, goal: 2, reward: '+150 🪙' },
    { label: 'Ramasse 200 pièces', value: g.missions.coins, goal: 200, reward: '+1 💎' },
  ];
  async function claimMission(i: number) {
    setBusy(true);
    const err = await g.claimMission(i + 1);
    setBusy(false);
    if (!err) sfx('coin');
    buy.showToast(err ?? `Mission accomplie ! ${MISSIONS[i].reward}`);
  }

  async function claim() {
    setBusy(true);
    const err = await g.claimDailyGift();
    setBusy(false);
    if (!err) sfx('coin');
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
            Missions <span>du jour</span>
          </h2>
          <ul className="missions">
            {MISSIONS.map((m, i) => {
              const done = m.value >= m.goal;
              const taken = (g.missions.claimed & (1 << i)) !== 0;
              return (
                <li key={m.label} className="mission">
                  <div className="mission-info">
                    <strong>{m.label}</strong>
                    <div className="mission-bar">
                      <div style={{ width: `${Math.min(100, (m.value / m.goal) * 100)}%` }} />
                    </div>
                    <small>
                      {Math.min(m.value, m.goal)} / {m.goal}
                    </small>
                  </div>
                  <button
                    className={`btn btn-small ${done && !taken ? 'btn-yellow' : 'btn-grey'}`}
                    disabled={busy || !done || taken}
                    onClick={() => void claimMission(i)}
                  >
                    {taken ? '✓ Reçu' : m.reward}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="legend shop-note">Les missions se renouvellent chaque jour à minuit (heure UTC).</p>
        </section>

        {packs.length > 0 && (
          <section className="chapter">
            <h2 className="chapter-title">
              Packs <span>duo −20 %</span>
            </h2>
            <p className="legend shop-note">Un personnage et sa soucoupe assortie, moins chers qu'à l'unité.</p>
            <div className="duo-list">
              {packs.map((b) => {
                const c = g.characters.find((x) => x.id === b.character_id);
                const s = g.ships.find((x) => x.id === b.ship_id);
                if (!c || !s) return null;
                const full = c.price + s.price;
                return (
                  <div className="duo" key={b.id}>
                    <div className="duo-art">
                      <CharacterArt color={c.color} accent={c.accent} variant={c.sort_order} size={64} />
                      <ShipArt color={s.color} accent={s.accent} variant={s.sort_order} size={104} />
                    </div>
                    <strong className="duo-name">
                      {c.name} + {s.name}
                    </strong>
                    <button
                      className={`btn btn-small ${gems >= b.price ? 'btn-yellow' : 'btn-grey'}`}
                      disabled={packBusy === b.id}
                      onClick={() => void buyPack(b.id, b.name)}
                    >
                      💎 {b.price} <s className="old-price">{full}</s>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="chapter">
          <h2 className="chapter-title">
            Personnages <span>à débloquer</span>
          </h2>
          {lockedChars.length === 0 ? (
            <p className="legend">Tu as débloqué tous les personnages. Bravo, pilote !</p>
          ) : (
            <div>
              {RARITY_ORDER.map((r) => {
                const grp = lockedChars.filter((it) => it.rarity === r);
                if (grp.length === 0) return null;
                return (
                  <div key={r} className="rarity-group">
                    <h3 className="rarity-title" style={{ color: RARITY_COLOR[r] }}>
                      {RARITY_LABEL[r]} <span>· {grp[0].price} 💎</span>
                    </h3>
                    <div className="tiles">
                      {grp.map((c) => (
                        <ItemTile key={c.id} kind="characters" item={c} owned={false} onOpen={() => setOpen({ kind: 'characters', id: c.id })} />
                      ))}
                    </div>
                  </div>
                );
              })}
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
            <div>
              {RARITY_ORDER.map((r) => {
                const grp = lockedShips.filter((it) => it.rarity === r);
                if (grp.length === 0) return null;
                return (
                  <div key={r} className="rarity-group">
                    <h3 className="rarity-title" style={{ color: RARITY_COLOR[r] }}>
                      {RARITY_LABEL[r]} <span>· {grp[0].price} 💎</span>
                    </h3>
                    <div className="tiles">
                      {grp.map((c) => (
                        <ItemTile key={c.id} kind="ships" item={c} owned={false} onOpen={() => setOpen({ kind: 'ships', id: c.id })} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Gagner <span>des gemmes</span>
          </h2>
          <ul className="earn">
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
