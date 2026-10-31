import { useEffect, useState } from 'react';
import { TopBar } from '../components/Ui';
import { supabase } from '../lib/supabase';
import { useGame } from '../lib/GameContext';
import { TROPHY_ROAD } from '../game/progress';
import { sfx } from '../lib/audio';

interface Row {
  rank: number;
  username: string;
  trophies: number;
  is_me: boolean;
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
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
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    void supabase.rpc('get_leaderboard').then(({ data, error: e }) => {
      if (!alive) return;
      if (e) setError(true);
      else setRows((data as Row[] | null) ?? []);
    });
    return () => {
      alive = false;
    };
  }, []);

  const medal = (r: number) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `${r}`);

  return (
    <div className="screen">
      <TopBar title="Classement" onBack={onBack} />
      <div className="scroll">
        <p className="legend">
          Tes trophées : 🏆 {profile?.trophies ?? 0}. Gagne des trophées en Battle Royale : 1er +30, 2e +20, 3e +10, 4e +5. Les dernières places en font perdre.
        </p>
        <h2 className="chapter-title">
          Route <span>des trophées</span>
        </h2>
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
        <h2 className="chapter-title">
          Meilleurs <span>pilotes</span>
        </h2>
        {error && <p className="legend">Impossible de charger le classement pour l'instant.</p>}
        {!rows && !error && <div className="loader" />}
        {rows && (
          <ul className="board">
            {rows.map((r) => (
              <li key={`${r.rank}-${r.username}`} className={`board-row ${r.is_me ? 'me' : ''}`}>
                <span className="board-rank">{medal(r.rank)}</span>
                <span className="board-name">{r.username}</span>
                <span className="board-score">🏆 {r.trophies}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
