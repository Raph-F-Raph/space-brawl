import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './lib/GameContext';
import { isConfigured } from './lib/supabase';
import { Backdrop, ComingSoon } from './components/Ui';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { PlayScreen } from './screens/PlayScreen';
import { ChaptersScreen } from './screens/ChaptersScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { LevelScreen } from './screens/LevelScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ClansScreen } from './screens/ClansScreen';
import { ShopScreen } from './screens/ShopScreen';
import { CHAPTERS } from './game/levels';
import { audioStats, setMusic, sfx, unlockAudio } from './lib/audio';
import type { Screen } from './types';

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}

function Shell() {
  const g = useGame();
  const [screen, setScreen] = useState<Screen>('home');
  const [chapter, setChapter] = useState(1);
  const [level, setLevel] = useState(1);
  const [runKey, setRunKey] = useState(0);
  const [soon, setSoon] = useState<string | null>(null);

  // Son : le navigateur n'autorise le son qu'après un premier toucher ; petit clic sur chaque bouton
  useEffect(() => {
    const onDown = (e: Event) => {
      unlockAudio();
      const b = (e.target as HTMLElement | null)?.closest?.('button');
      if (b && !(b as HTMLButtonElement).disabled) sfx('click');
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('touchend', unlockAudio, true);
    if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __audio?: unknown }).__audio = audioStats;
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('touchend', unlockAudio, true);
    };
  }, []);
  // La musique change selon l'écran : calme dans les menus, rythmée en niveau
  useEffect(() => {
    setMusic(g.session ? (screen === 'level' || screen === 'arena' ? 'level' : 'menu') : null);
  }, [screen, g.session]);

  // Après une déconnexion, on repart toujours de l'écran d'accueil
  useEffect(() => {
    if (!g.session) setScreen('home');
  }, [g.session]);

  // Le look de l'écran d'accueil change quand un chapitre est terminé
  let theme = 0;
  while (theme < CHAPTERS.length && g.clearedLevel(CHAPTERS[theme].id) >= CHAPTERS[theme].levels.length) theme++;

  function startLevel(c: number, l: number) {
    setChapter(c);
    setLevel(l);
    setRunKey((k) => k + 1);
    setScreen('level');
  }

  let content;
  if (!isConfigured) {
    content = (
      <div className="screen auth">
        <div className="auth-card">
          <h1 className="logo">
            SPACE
            <br />
            BRAWL
          </h1>
          <p className="auth-message">
            Il manque la configuration Supabase. Ajoute <code>VITE_SUPABASE_URL</code> et{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> (voir le fichier LISEZMOI.md), puis relance l'app.
          </p>
        </div>
      </div>
    );
  } else if (g.loading) {
    content = (
      <div className="screen center">
        <div className="loader" aria-label="Chargement" />
      </div>
    );
  } else if (!g.session) {
    content = <AuthScreen />;
  } else if (!g.profile || !g.character || !g.ship) {
    content = (
      <div className="screen center">
        <div className="auth-card">
          <p className="auth-message">
            Chargement de ton profil… Si ça dure, vérifie que le fichier <code>supabase/schema.sql</code> a bien été
            exécuté dans Supabase.
          </p>
          <div className="loader" />
          <button className="btn btn-red btn-small" onClick={() => void g.signOut()}>
            Se déconnecter
          </button>
        </div>
      </div>
    );
  } else if (screen === 'level') {
    content = (
      <LevelScreen
        key={`${chapter}-${level}-${runKey}`}
        chapter={chapter}
        level={level}
        onExit={() => setScreen('chapters')}
        onRetry={() => startLevel(chapter, level)}
        onNext={(l) => startLevel(chapter, l)}
        onNextChapter={() => startLevel(chapter + 1, 1)}
      />
    );
  } else if (screen === 'arena') {
    content = <ArenaScreen key={`arena-${runKey}`} onExit={() => setScreen('play')} onRetry={() => setRunKey((k) => k + 1)} />;
  } else if (screen === 'characters') {
    content = <CollectionScreen kind="characters" onBack={() => setScreen('home')} />;
  } else if (screen === 'ships') {
    content = <CollectionScreen kind="ships" onBack={() => setScreen('home')} />;
  } else if (screen === 'clans') {
    content = <ClansScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'shop') {
    content = <ShopScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'play') {
    content = <PlayScreen onBack={() => setScreen('home')} onNavigate={setScreen} />;
  } else if (screen === 'chapters') {
    content = <ChaptersScreen onBack={() => setScreen('play')} onStart={startLevel} />;
  } else if (screen === 'settings') {
    content = <SettingsScreen onBack={() => setScreen('home')} />;
  } else {
    content = <HomeScreen onNavigate={setScreen} onSoon={setSoon} />;
  }

  return (
    <div className="app">
      <Backdrop theme={theme} />
      {content}
      {soon && <ComingSoon what={soon} onClose={() => setSoon(null)} />}
    </div>
  );
}
