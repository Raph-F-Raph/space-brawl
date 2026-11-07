import { useState } from 'react';
import { Icon, rich } from '../components/Icon';
import { TopBar } from '../components/Ui';
import { useGame } from '../lib/GameContext';
import { ACHIEVEMENTS, type AchMetric } from '../game/progress';
import { sfx } from '../lib/audio';

export function AchievementsScreen({ onBack }: { onBack: () => void }) {
  const { profile, progress, ownedCharacters, ownedShips, ownedSkins, achClaims, claimAchievement } = useGame();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const value: Record<AchMetric, number> = {
    levels: progress.reduce((n, p) => n + p.cleared_level, 0),
    chapters: progress.filter((p) => p.cleared_level >= 5).length,
    chars: ownedCharacters.size,
    ships: ownedShips.size,
    skins: ownedSkins.size,
    trophies: profile?.trophies ?? 0,
  };

  async function claim(step: number) {
    setBusy(true);
    const err = await claimAchievement(step);
    setBusy(false);
    if (!err) sfx('coin');
    setMsg(err ?? 'Récompense récupérée !');
  }

  const ready = ACHIEVEMENTS.filter((a, i) => !achClaims.has(i + 1) && value[a.metric] >= a.need).length;

  return (
    <div className="screen">
      <TopBar title="Succès" onBack={onBack} />
      <div className="scroll">
        <p className="legend">
          {ready > 0 ? `${ready} récompense${ready > 1 ? 's' : ''} à récupérer !` : 'Remplis des objectifs pour gagner des pièces et des gemmes.'}
        </p>
        {msg && <p className="legend">{msg}</p>}
        <ul className="missions">
          {ACHIEVEMENTS.map((a, i) => {
            const taken = achClaims.has(i + 1);
            const cur = value[a.metric];
            const ok = cur >= a.need;
            return (
              <li key={i} className="mission">
                <div className="mission-info">
                  <strong>{a.label}</strong>
                  <div className="mission-bar">
                    <div style={{ width: `${Math.min(100, (cur / a.need) * 100)}%` }} />
                  </div>
                  <small>{Math.min(cur, a.need)} / {a.need}</small>
                </div>
                <button
                  className={`btn btn-small ${ok && !taken ? 'btn-yellow' : 'btn-grey'}`}
                  disabled={busy || !ok || taken}
                  onClick={() => void claim(i + 1)}
                >
                  {rich(taken ? '✓ Reçu' : a.coins ? `+${a.coins} 🪙` : `+${a.gems} 💎`)}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="legend"><Icon n="star" /> Les objectifs se valident automatiquement.</p>
      </div>
    </div>
  );
}
