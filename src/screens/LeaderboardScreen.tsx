import { useEffect, useState } from 'react';
import { TopBar } from '../components/Ui';
import { supabase } from '../lib/supabase';
import { useGame } from '../lib/GameContext';

interface Row {
  rank: number;
  username: string;
  trophies: number;
  is_me: boolean;
}

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const { profile } = useGame();
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
