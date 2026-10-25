import { useGame } from '../lib/GameContext';
import { TopBar } from '../components/Ui';
import { CHAPTERS } from '../game/levels';

export function ChaptersScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (chapter: number, level: number) => void;
}) {
  const { clearedLevel } = useGame();

  return (
    <div className="screen">
      <TopBar title="Chapitres" onBack={onBack} />
      <div className="scroll">
        {CHAPTERS.map((ch) => {
          const cleared = clearedLevel(ch.id);
          return (
            <section className="chapter" key={ch.id}>
              <h2 className="chapter-title">
                Chapitre {ch.id} <span>— {ch.name}</span>
              </h2>
              <div className="path">
                {ch.levels.map((lv) => {
                  const state = lv.level <= cleared ? 'done' : lv.level === cleared + 1 ? 'current' : 'locked';
                  return (
                    <div className="node-wrap" key={lv.level}>
                      <button
                        className={`node node-${state} ${lv.isBoss ? 'node-boss' : ''}`}
                        disabled={state === 'locked'}
                        onClick={() => onStart(ch.id, lv.level)}
                        aria-label={`Niveau ${lv.level} : ${lv.name}`}
                      >
                        {state === 'locked' ? '🔒' : lv.isBoss ? '👹' : lv.level}
                        {state === 'done' && <span className="check">✓</span>}
                      </button>
                      <span className="node-name">{lv.isBoss ? 'BOSS' : `Niveau ${lv.level}`}</span>
                      <span className="node-sub">{lv.name}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="chapter chapter-locked">
          <h2 className="chapter-title">
            Chapitre 2 <span>— Bientôt</span>
          </h2>
          <p className="legend">
            Termine le chapitre 1 pour changer le look de ton écran d'accueil… de nouveaux chapitres arrivent !
          </p>
        </section>
      </div>
    </div>
  );
}
