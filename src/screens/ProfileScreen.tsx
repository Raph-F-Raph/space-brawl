import { TopBar } from '../components/Ui';
import { useGame } from '../lib/GameContext';
import type { Screen } from '../types';

export function ProfileScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (s: Screen) => void }) {
  const { profile } = useGame();
  return (
    <div className="screen">
      <TopBar title="Mon profil" onBack={onBack} />
      <div className="scroll">
        <div className="panel">
          <p className="row">
            <span>Pilote</span>
            <strong>{profile?.username}</strong>
          </p>
          <p className="row">
            <span>Trophées</span>
            <strong>🏆 {profile?.trophies ?? 0}</strong>
          </p>
        </div>
        <div className="modes">
          <button className="btn btn-yellow" onClick={() => onNavigate('trophyroad')}>
            🏆 Route des trophées
          </button>
          <button className="btn btn-blue" onClick={() => onNavigate('leaderboard')}>
            📊 Classement des pilotes
          </button>
        </div>
      </div>
    </div>
  );
}
