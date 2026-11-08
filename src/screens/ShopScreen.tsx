import { useState } from 'react';
import { Icon, rich } from '../components/Icon';
import { useGame, type ChestLoot } from '../lib/GameContext';
import { useBuyFlow } from '../components/BuyFlow';
import { CharacterArt, ShipArt } from '../components/Art';
import { ItemSheet } from '../components/ItemSheet';
import { sfx } from '../lib/audio';
import { byRarity, RARITY_COLOR, RARITY_LABEL, RARITY_ORDER } from '../types';
import { ItemTile } from '../components/ItemTile';
import type { Kind } from '../components/ItemCard';
import { Modal, TopBar } from '../components/Ui';
import { COINS_DAILY, GEMS_BOSS_FIRST_CLEAR, GEMS_DAILY } from '../game/progress';

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const buy = useBuyFlow();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<{ kind: Kind; id: string } | null>(null);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);

  async function submitCode() {
    if (!code.trim() || codeBusy) return;
    setCodeBusy(true);
    const r = await g.redeemCode(code);
    setCodeBusy(false);
    setCodeMsg({ ok: r.ok, text: r.message });
    if (r.ok) {
      setCode('');
      sfx('win');
    }
  }

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

  const CHESTS = [
    { kind: 'bronze' as const, icon: 'chestB', name: 'Coffre Bronze', cost: 300, unit: '🪙', hint: 'Pièces ou gemmes, avec une petite chance d\'avoir un pilote, une soucoupe ou un skin.' },
    { kind: 'argent' as const, icon: 'chestS', name: 'Coffre Argent', cost: 8, unit: '💎', hint: 'Plus de gains, et une chance d\'avoir un pilote, une soucoupe ou un skin (jusqu\'à épique).' },
    { kind: 'or' as const, icon: 'chestG', name: 'Méga Coffre Or', cost: 20, unit: '💎', hint: 'Gros gains, et la meilleure chance d\'avoir un pilote, une soucoupe ou un skin (jusqu\'à légendaire).' },
  ];
  const [opening, setOpening] = useState<string | null>(null);
  const [loot, setLoot] = useState<{ chest: string; icon: string; loot: ChestLoot } | null>(null);
  async function openChest(c: (typeof CHESTS)[number]) {
    setOpening(c.kind);
    const [res] = await Promise.all([g.openChest(c.kind), new Promise((r) => setTimeout(r, 900))]);
    setOpening(null);
    if (res.error || !res.loot) {
      buy.showToast(res.error ?? 'Ouverture impossible');
      return;
    }
    sfx(res.loot.type === 'coins' || res.loot.type === 'gems' ? 'coin' : 'buy');
    setLoot({ chest: c.name, icon: c.icon, loot: res.loot });
  }
  function lootText(l: ChestLoot): string {
    if (l.type === 'coins') return `+${l.amount} 🪙`;
    if (l.type === 'gems') return `+${l.amount} 💎`;
    const what = l.type === 'character' ? 'Nouveau pilote' : l.type === 'ship' ? 'Nouvelle soucoupe' : 'Nouveau skin';
    return `${what} : ${l.name} !`;
  }

  async function exchange(n: number) {
    setBusy(true);
    const err = await g.exchangeGems(n);
    setBusy(false);
    if (!err) sfx('coin');
    buy.showToast(err ?? `Échange réussi : +${n * 100} 🪙`);
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
            Chaque jour : {GEMS_DAILY} <Icon n="gem" /> et {COINS_DAILY} <Icon n="coin" /> offerts.
          </p>
          <div className="exchange">
            <button className="btn btn-yellow" disabled={busy || giftTaken} onClick={() => void claim()}>
              {giftTaken ? 'Reviens demain !' : rich('🎁 Récupérer')}
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
                    {rich(taken ? '✓ Reçu' : m.reward)}
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
                      <Icon n="gem" /> {b.price} <s className="old-price">{full}</s>
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
                      {RARITY_LABEL[r]} <span>· {grp[0].price} <Icon n="gem" /></span>
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
                      {RARITY_LABEL[r]} <span>· {grp[0].price} <Icon n="gem" /></span>
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
              <strong>+{GEMS_BOSS_FIRST_CLEAR} <Icon n="gem" /></strong> la première fois que tu bats un méga boss
            </li>
            <li>
              <strong>+{GEMS_DAILY} <Icon n="gem" /></strong> chaque jour avec le cadeau du jour
            </li>
          </ul>
          <p className="legend">Les pièces <Icon n="coin" /> servent à améliorer tes personnages et soucoupes (écrans Personnages et Soucoupes).</p>
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Méga <span>coffres</span>
          </h2>
          <div className="packs">
            {CHESTS.map((c) => {
              const have = c.unit === '🪙' ? (g.profile?.coins ?? 0) : gems;
              return (
                <div className={`pack chest ${opening === c.kind ? 'shaking' : ''}`} key={c.kind}>
                  <span className="pack-icon"><Icon n={c.icon} size="1.1em" /></span>
                  <strong>{c.name}</strong>
                  <small className="legend">{c.hint}</small>
                  <button className={`btn btn-small ${have >= c.cost ? 'btn-yellow' : 'btn-grey'}`} disabled={opening !== null || have < c.cost} onClick={() => void openChest(c)}>
                    {rich(c.unit)} {c.cost}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="legend shop-note">Un objet n'est pas garanti : c'est une chance. Ceux que tu as déjà ne sortent pas.</p>
        </section>

        <section className="chapter">
          <h2 className="chapter-title">
            Échange <span>gemmes → pièces</span>
          </h2>
          <p className="legend shop-note">1 <Icon n="gem" /> = 100 <Icon n="coin" />. Pratique pour améliorer vite tes pilotes.</p>
          <div className="packs">
            {[1, 5, 20].map((n) => (
              <div className="pack" key={n}>
                <span className="pack-icon"><Icon n="coin" /></span>
                <strong>{n * 100} <Icon n="coin" /></strong>
                <button className={`btn btn-small ${gems >= n ? 'btn-yellow' : 'btn-grey'}`} disabled={busy || gems < n} onClick={() => void exchange(n)}>
                  <Icon n="gem" /> {n}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="chapter chapter-locked">
          <h2 className="chapter-title">
            Packs <span>bientôt</span>
          </h2>
          <p className="legend shop-note">Gemmes <Icon n="gem" /></p>
          <div className="packs">
            {[[20, '0,99 €'], [45, '1,99 €'], [120, '4,99 €'], [260, '9,99 €'], [560, '19,99 €']].map(([n, p]) => (
              <div className="pack" key={n} aria-disabled="true">
                <span className="pack-icon"><Icon n="gem" /></span>
                <strong>{n}</strong>
                <span className="badge">{p}</span>
              </div>
            ))}
          </div>
          <p className="legend shop-note">Pièces <Icon n="coin" /></p>
          <div className="packs">
            {[[600, '0,99 €'], [1500, '1,99 €'], [4000, '4,99 €']].map(([n, p]) => (
              <div className="pack" key={n} aria-disabled="true">
                <span className="pack-icon"><Icon n="coin" /></span>
                <strong>{n}</strong>
                <span className="badge">{p}</span>
              </div>
            ))}
          </div>
          <p className="legend">Les achats avec de l'argent réel arriveront à la sortie sur le Play Store.</p>
        </section>

        <section className="chapter code-box">
          <h2 className="chapter-title">Code secret</h2>
          <form
            className="code-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submitCode();
            }}
          >
            <input
              className="code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeMsg(null);
              }}
              placeholder="Entre un code"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={40}
              aria-label="Code secret"
            />
            <button className="btn btn-green btn-small" type="submit" disabled={codeBusy || !code.trim()}>
              Valider
            </button>
          </form>
          {codeMsg && <p className={`code-msg ${codeMsg.ok ? 'ok' : 'ko'}`}>{codeMsg.text}</p>}
        </section>
      </div>

      {open && (
        <ItemSheet kind={open.kind} id={open.id} onClose={() => setOpen(null)} onBuy={buy.askBuy} onToast={buy.showToast} />
      )}
      {loot && (
        <Modal title={loot.chest} onClose={() => setLoot(null)}>
          <p className="chest-loot">
            <span className="chest-open"><Icon n={loot.icon} size="1em" /></span>
            <strong>{rich(lootText(loot.loot))}</strong>
          </p>
        </Modal>
      )}
      {buy.ui}
    </div>
  );
}
