import { TopBar } from '../components/Ui';
import type { Screen } from '../types';
import { useGame } from '../lib/GameContext';

export function PlayScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (s: Screen) => void;
}) {
  const { profile } = useGame();
  return (
    <div className="screen">
      <TopBar title="Choisis ton mode" onBack={onBack} />
      <div className="scroll">
        <div className="modes">
          <button className="mode-card mode-royale" onClick={() => onNavigate('arena')}>
            <div className="mode-icon">💥</div>
            <h2 className="mode-title">Battle Royale</h2>
            <p className="mode-desc">
              8 pilotes, une zone qui se referme… Le dernier en vie gagne ! Tu affrontes 7 robots pour l'instant, de vrais joueurs arriveront plus tard.
            </p>
            <span className="mode-tag">8 pilotes · contre des robots · 🏆 {profile?.trophies ?? 0}</span>
          </button>

          <button className="mode-card mode-story" onClick={() => onNavigate('chapters')}>
            <div className="mode-icon">🌌</div>
            <h2 className="mode-title">Chapitres</h2>
            <p className="mode-desc">
              Traverse les niveaux, affronte des hordes de monstres et bats le méga boss de chaque chapitre.
            </p>
            <span className="mode-tag">Solo · jouable hors ligne</span>
          </button>
        </div>
        <div className="modes">
          <button className="btn btn-blue" onClick={() => onNavigate('leaderboard')}>
            🏆 Classement des pilotes
          </button>
        </div>
      </div>
    </div>
  );
}
