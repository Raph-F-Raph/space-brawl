import { useState } from 'react';
import { TopBar } from '../components/Ui';
import { useGame } from '../lib/GameContext';
import { TROPHY_ROAD } from '../game/progress';
import { sfx } from '../lib/audio';

export function TrophyRoadScreen({ onBack }: { onBack: () => void }) {
  const { profile, trophyClaims, claimTrophy } = useGame();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const trophies = profile?.trophies ?? 0;
  async function claim(step: number) {
    setBusy(true);
    const err = await claimTrophy(step);
    setBusy(false);
    if (!err) sfx('coin');
    setMsg(err ?? 'Récompense récupérée !');
  }

  return (
    <div className="screen">
      <TopBar title="Route des trophées" onBack={onBack} />
      <div className="scroll">
        <p className="legend">Tes trophées : 🏆 {trophies}. Gagne des trophées en Battle Royale pour débloquer des récompenses.</p>
        {msg && <p className="legend">{msg}</p>}
        <ul className="missions">
          {TROPHY_ROAD.map((s, i) => {
            const taken = trophyClaims.has(i + 1);
            const ready = trophies >= s.need;
            return (
              <li key={s.need} className="mission">
                <div className="mission-info">
                  <strong>🏆 {s.need}</strong>
                  <div className="mission-bar">
                    <div style={{ width: `${Math.min(100, (trophies / s.need) * 100)}%` }} />
                  </div>
                </div>
                <button
                  className={`btn btn-small ${ready && !taken ? 'btn-yellow' : 'btn-grey'}`}
                  disabled={busy || !ready || taken}
                  onClick={() => void claim(i + 1)}
                >
                  {taken ? '✓ Reçu' : s.coins ? `+${s.coins} 🪙` : `+${s.gems} 💎`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
