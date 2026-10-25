import { TopBar } from '../components/Ui';
import type { Screen } from '../types';

export function PlayScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <div className="screen">
      <TopBar title="Choisis ton mode" onBack={onBack} />
      <div className="scroll">
        <div className="modes">
          <section className="mode-card mode-royale disabled" aria-disabled="true">
            <span className="badge">Bientôt</span>
            <div className="mode-icon">💥</div>
            <h2 className="mode-title">Battle Royale</h2>
            <p className="mode-desc">
              8 pilotes en ligne, une zone qui se referme… Le dernier en vie gagne !
            </p>
            <span className="mode-tag">En ligne · 8 joueurs</span>
          </section>

          <button className="mode-card mode-story" onClick={() => onNavigate('chapters')}>
            <div className="mode-icon">🌌</div>
            <h2 className="mode-title">Chapitres</h2>
            <p className="mode-desc">
              Traverse les niveaux, affronte des hordes de monstres et bats le méga boss de chaque chapitre.
            </p>
            <span className="mode-tag">Solo · jouable hors ligne</span>
          </button>
        </div>
      </div>
    </div>
  );
}
