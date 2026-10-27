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
          const prev = CHAPTERS.find((c) => c.id === ch.id - 1);
          const open = !prev || clearedLevel(prev.id) >= prev.levels.length; // chapitre précédent terminé ?
          return (
            <section className={`chapter ${open ? '' : 'chapter-locked'}`} key={ch.id}>
              <h2 className="chapter-title">
                Chapitre {ch.id} <span>— {ch.name}</span>
              </h2>
              <div className="path">
                {ch.levels.map((lv) => {
                  const state = !open ? 'locked' : lv.level <= cleared ? 'done' : lv.level === cleared + 1 ? 'current' : 'locked';
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
              {!open && <p className="legend">Termine le chapitre {ch.id - 1} pour débloquer celui-ci.</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
