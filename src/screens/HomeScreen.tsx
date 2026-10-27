import { useGame } from '../lib/GameContext';
import { ShipWithPilot } from '../components/Art';
import { Currency } from '../components/Ui';
import { CHAPTERS } from '../game/levels';
import type { Screen } from '../types';

export function HomeScreen({
  onNavigate,
  onSoon,
}: {
  onNavigate: (s: Screen) => void;
  onSoon: (what: string) => void;
}) {
  const { profile, character, ship, charLevel, shipLevel, clearedLevel } = useGame();
  // Chapitre en cours = le premier pas encore terminé
  const chapter = CHAPTERS.find((c) => clearedLevel(c.id) < c.levels.length) ?? CHAPTERS[CHAPTERS.length - 1];
  const cleared = clearedLevel(chapter.id);
  const done = cleared >= chapter.levels.length;

  return (
    <div className="screen home">
      <header className="topbar">
        <div className="player-pill">
          <div className="avatar">{(profile?.username ?? '?').slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="player-name">{profile?.username}</div>
            <div className="player-sub">
              {done ? 'Tous les chapitres terminés ★' : `Chapitre ${chapter.id} · niveau ${Math.min(cleared + 1, 5)}/5`}
            </div>
          </div>
        </div>
        <div className="spacer" />
        <Currency icon="🪙" value={profile?.coins ?? 0} />
        <Currency icon="💎" value={profile?.gems ?? 0} />
      </header>

      <main className="stage">
        <div className="stage-ship">
          <ShipWithPilot ship={ship} character={character} size="min(70vw, 62vh, 460px)" />
        </div>
        <div className="stage-names">
          {character?.name ?? '—'} <em className="lvl">niv. {charLevel}</em> <span>·</span> {ship?.name ?? '—'}{' '}
          <em className="lvl">niv. {shipLevel}</em>
        </div>
      </main>

      <footer className="home-footer">
        <nav className="menu-row">
          <button className="nav-btn" onClick={() => onNavigate('shop')}>
            <span className="nav-icon">🛒</span>
            Boutique
          </button>
          <button className="nav-btn" onClick={() => onNavigate('ships')}>
            <span className="nav-icon">🛸</span>
            Soucoupes
          </button>
          <button className="nav-btn" onClick={() => onNavigate('characters')}>
            <span className="nav-icon">🧑‍🚀</span>
            Personnages
          </button>
          <button className="nav-btn" onClick={() => onNavigate('clans')}>
            <span className="nav-icon">🛡️</span>
            Clans
          </button>
          <button className="nav-btn" onClick={() => onNavigate('settings')}>
            <span className="nav-icon">⚙️</span>
            Réglages
          </button>
        </nav>
        <button className="btn btn-yellow btn-play" onClick={() => onNavigate('play')}>
          JOUER
        </button>
      </footer>
    </div>
  );
}
