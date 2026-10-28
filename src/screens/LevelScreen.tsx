import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useGame } from '../lib/GameContext';
import { Engine, makeStats } from '../game/engine';
import { CHAPTERS, getChapter, getLevel } from '../game/levels';

const JOY_RADIUS = 60;
const FIRE_RADIUS = 55;

interface Props {
  chapter: number;
  level: number;
  onExit: () => void; // retour à la carte des niveaux
  onRetry: () => void;
  onNext: (level: number) => void;
  onNextChapter: () => void;
}

export function LevelScreen({ chapter, level, onExit, onRetry, onNext, onNextChapter }: Props) {
  const { character, ship, charLevel, shipLevel, finishLevel } = useGame();
  const def = getLevel(chapter, level);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  // éléments mis à jour directement à chaque image (sans re-render React)
  const hpFill = useRef<HTMLDivElement>(null);
  const hpText = useRef<HTMLSpanElement>(null);
  const waveText = useRef<HTMLSpanElement>(null);
  const coinText = useRef<HTMLSpanElement>(null);
  const bossBar = useRef<HTMLDivElement>(null);
  const bossFill = useRef<HTMLDivElement>(null);
  const joyBase = useRef<HTMLDivElement>(null);
  const joyKnob = useRef<HTMLDivElement>(null);

  const fireBase = useRef<HTMLDivElement>(null);
  const fireKnob = useRef<HTMLDivElement>(null);
  const firePointer = useRef<number | null>(null);
  const fireOrigin = useRef({ x: 0, y: 0 });
  const joyPointer = useRef<number | null>(null);
  const joyOrigin = useRef({ x: 0, y: 0 });

  const [userPaused, setUserPaused] = useState(false);
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches);
  const [firing, setFiring] = useState(false);
  const [result, setResult] = useState<{ won: boolean; coins: number } | null>(null);

  const pausedRef = useRef(false);
  pausedRef.current = userPaused || portrait;

  const handleEnd = useCallback(
    (r: { won: boolean; coins: number }) => {
      // Défaite : tu gardes la moitié des pièces ramassées
      const reward = r.won ? r.coins : Math.floor(r.coins / 2);
      setResult({ won: r.won, coins: reward });
      void finishLevel(chapter, level, reward, r.won);
    },
    [chapter, level, finishLevel]
  );
  const endRef = useRef(handleEnd);
  endRef.current = handleEnd;

  // --- Création du moteur de jeu ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !character || !ship) return;

    const engine = new Engine(canvas, def, makeStats(character, ship, charLevel, shipLevel), {
      onHud: (h) => {
        if (hpFill.current) hpFill.current.style.width = `${(h.hp / h.maxHp) * 100}%`;
        if (hpText.current) hpText.current.textContent = `${h.hp}`;
        if (waveText.current) waveText.current.textContent = h.boss ? 'Bats le boss !' : h.portalOpen ? 'Portail ouvert ➜' : `Portail ${h.progress} %`;
        if (coinText.current) coinText.current.textContent = `${h.coins}`;
        if (bossBar.current) bossBar.current.style.display = h.boss ? 'block' : 'none';
        if (bossFill.current && h.boss) bossFill.current.style.width = `${(h.boss.hp / h.boss.max) * 100}%`;
      },
      onEnd: (r) => endRef.current(r),
    });
    engine.paused = pausedRef.current;
    engineRef.current = engine;
    // pour les tests automatiques uniquement : ajouter ?debug à l'adresse
    if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __engine?: Engine }).__engine = engine;

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      engine.resize(rect.width, rect.height, window.devicePixelRatio || 1);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    fit();
    engine.start();

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
    // On relance seulement si le niveau, le personnage ou la soucoupe changent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def, character?.id, ship?.id]);

  // --- Pause (bouton, écran en portrait, application en arrière-plan) ---
  useEffect(() => {
    if (engineRef.current) engineRef.current.paused = userPaused || portrait;
  }, [userPaused, portrait]);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const onChange = () => setPortrait(mq.matches);
    mq.addEventListener('change', onChange);
    const onHide = () => {
      if (document.hidden) setUserPaused(true);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      mq.removeEventListener('change', onChange);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  // --- Clavier (ordinateur) ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
      if (k === 'escape') setUserPaused((p) => !p);
      engineRef.current?.keys.add(k);
    };
    const up = (e: KeyboardEvent) => engineRef.current?.keys.delete(e.key.toLowerCase());
    const clear = () => engineRef.current?.keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // --- Joystick tactile ---
  function joyDown(e: RPointerEvent<HTMLDivElement>) {
    if (joyPointer.current !== null) return;
    joyPointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    joyOrigin.current = { x: e.clientX, y: e.clientY };
    if (joyBase.current) {
      joyBase.current.style.display = 'block';
      joyBase.current.style.left = `${e.clientX - rect.left}px`;
      joyBase.current.style.top = `${e.clientY - rect.top}px`;
    }
    if (joyKnob.current) joyKnob.current.style.transform = 'translate(-50%, -50%)';
  }
  function joyMove(e: RPointerEvent<HTMLDivElement>) {
    if (e.pointerId !== joyPointer.current) return;
    const dx = e.clientX - joyOrigin.current.x;
    const dy = e.clientY - joyOrigin.current.y;
    const m = Math.hypot(dx, dy);
    const k = m > JOY_RADIUS ? JOY_RADIUS / m : 1;
    const engine = engineRef.current;
    if (engine) {
      engine.joy.x = (dx * k) / JOY_RADIUS;
      engine.joy.y = (dy * k) / JOY_RADIUS;
    }
    if (joyKnob.current) {
      joyKnob.current.style.transform = `translate(calc(-50% + ${dx * k}px), calc(-50% + ${dy * k}px))`;
    }
  }
  function joyUp(e: RPointerEvent<HTMLDivElement>) {
    if (e.pointerId !== joyPointer.current) return;
    joyPointer.current = null;
    if (engineRef.current) engineRef.current.joy = { x: 0, y: 0 };
    if (joyBase.current) joyBase.current.style.display = 'none';
  }

  // --- Bouton d'attaque flottant : il apparaît sous le pouce, comme le joystick ---
  // Tenir = tirer (visée automatique). Glisser = viser à la main dans la direction du glissement.
  function fireDown(e: RPointerEvent<HTMLDivElement>) {
    if (firePointer.current !== null) return;
    firePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    fireOrigin.current = { x: e.clientX, y: e.clientY };
    if (fireBase.current) {
      fireBase.current.style.display = 'block';
      fireBase.current.style.left = `${e.clientX - rect.left}px`;
      fireBase.current.style.top = `${e.clientY - rect.top}px`;
    }
    if (fireKnob.current) fireKnob.current.style.transform = 'translate(-50%, -50%)';
    if (engineRef.current) {
      engineRef.current.fireBtn = true;
      engineRef.current.aim = null;
    }
    setFiring(true);
  }
  function fireMove(e: RPointerEvent<HTMLDivElement>) {
    if (e.pointerId !== firePointer.current) return;
    const dx = e.clientX - fireOrigin.current.x;
    const dy = e.clientY - fireOrigin.current.y;
    const m = Math.hypot(dx, dy);
    const k = m > FIRE_RADIUS ? FIRE_RADIUS / m : 1;
    if (fireKnob.current) {
      fireKnob.current.style.transform = `translate(calc(-50% + ${dx * k}px), calc(-50% + ${dy * k}px))`;
    }
    if (engineRef.current) engineRef.current.aim = m > 14 ? { x: dx / m, y: dy / m } : null;
  }
  function fireUp(e: RPointerEvent<HTMLDivElement>) {
    if (e.pointerId !== firePointer.current) return;
    firePointer.current = null;
    if (engineRef.current) {
      engineRef.current.fireBtn = false;
      engineRef.current.aim = null;
    }
    if (fireBase.current) fireBase.current.style.display = 'none';
    setFiring(false);
  }

  const isLast = level >= 5;

  return (
    <div className="level">
      <div className="level-canvas" ref={wrapRef}>
        <canvas ref={canvasRef} />
      </div>

      {/* Affichage tête haute */}
      <div className="hud">
        <div className="hud-hp" aria-label="Points de vie">
          <div className="hud-hp-fill" ref={hpFill} />
          <span className="hud-hp-text">
            ❤ <span ref={hpText}>0</span>
          </span>
        </div>
        <div className="hud-center">
          <span className="hud-level">{def.isBoss ? 'BOSS' : `Niveau ${level}`}</span>
          <span className="hud-wave" ref={waveText}>
            Portail 0 %
          </span>
        </div>
        <div className="hud-right">
          <div className="currency small">
            <span className="currency-icon">🪙</span>
            <span className="currency-value" ref={coinText}>
              0
            </span>
          </div>
          <button className="btn btn-blue btn-icon" onClick={() => setUserPaused(true)} aria-label="Pause">
            ⏸
          </button>
        </div>
      </div>
      <div className="boss-bar" ref={bossBar} style={{ display: 'none' }}>
        <span className="boss-name">👹 {getChapter(chapter).theme.bossName}</span>
        <div className="boss-track">
          <div className="boss-fill" ref={bossFill} />
        </div>
      </div>

      {/* Commandes tactiles */}
      <div
        className="joy-zone"
        onPointerDown={joyDown}
        onPointerMove={joyMove}
        onPointerUp={joyUp}
        onPointerCancel={joyUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="joy-base" ref={joyBase} style={{ display: 'none' }}>
          <div className="joy-knob" ref={joyKnob} />
        </div>
      </div>
      <div
        className="fire-zone"
        onPointerDown={fireDown}
        onPointerMove={fireMove}
        onPointerUp={fireUp}
        onPointerCancel={fireUp}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Attaquer : pose le doigt pour tirer, glisse pour viser"
      >
        <div className={`fire-hint ${firing ? 'hidden' : ''}`}>💥</div>
        <div className="fire-base" ref={fireBase} style={{ display: 'none' }}>
          <div className="fire-knob" ref={fireKnob}>
            💥
          </div>
        </div>
      </div>

      {/* Pause */}
      {userPaused && !result && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="title">Pause</h2>
            <div className="modal-actions">
              <button className="btn btn-green" onClick={() => setUserPaused(false)}>
                Reprendre
              </button>
              <button className="btn btn-red" onClick={onExit}>
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demande de tourner le téléphone */}
      {portrait && !result && (
        <div className="rotate-hint">
          <div className="rotate-icon">📱</div>
          <h2 className="title">Tourne ton téléphone</h2>
          <p>Space Brawl se joue en mode paysage.</p>
          <button className="btn btn-red btn-small" onClick={onExit}>
            Quitter le niveau
          </button>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="modal-overlay">
          <div className="modal result">
            <h2 className={`title ${result.won ? 'win' : 'lose'}`}>{result.won ? 'VICTOIRE !' : 'DÉFAITE…'}</h2>
            <p className="reward">
              +{result.coins} <span>🪙</span>
            </p>
            {result.won && isLast && (
              <p className="modal-body">Chapitre terminé ! Ton écran d'accueil change de style ✨</p>
            )}
            {!result.won && <p className="modal-body">Tu gardes la moitié des pièces ramassées.</p>}
            <div className="modal-actions">
              {result.won && !isLast && (
                <button className="btn btn-yellow" onClick={() => onNext(level + 1)}>
                  Niveau suivant
                </button>
              )}
              {result.won && isLast && chapter < CHAPTERS.length && (
                <button className="btn btn-yellow" onClick={onNextChapter}>
                  Chapitre suivant
                </button>
              )}
              <button className={`btn ${result.won ? 'btn-blue' : 'btn-yellow'}`} onClick={onRetry}>
                Rejouer
              </button>
              <button className="btn btn-red" onClick={onExit}>
                {result.won && isLast ? 'Terminer' : 'Menu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
