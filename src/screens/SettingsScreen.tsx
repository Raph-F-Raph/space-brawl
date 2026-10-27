import { useEffect, useState } from 'react';
import { useGame } from '../lib/GameContext';
import { TopBar } from '../components/Ui';
import { loadSettings, saveSettings } from '../lib/settings';
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from '../lib/install';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { profile, session, signOut } = useGame();
  const [vibration, setVibration] = useState(loadSettings().vibration);
  const [canInstall, setCanInstall] = useState(canPromptInstall());
  useEffect(() => onInstallChange(() => setCanInstall(canPromptInstall())), []);
  const installed = isStandalone();

  function toggleVibration() {
    const next = !vibration;
    setVibration(next);
    saveSettings({ vibration: next });
  }

  return (
    <div className="screen">
      <TopBar title="Réglages" onBack={onBack} />
      <div className="scroll">
        <div className="panel">
          <h2 className="panel-title">Compte</h2>
          <p className="row">
            <span>Pseudo</span>
            <strong>{profile?.username}</strong>
          </p>
          <p className="row">
            <span>E-mail</span>
            <strong>{session?.user.email}</strong>
          </p>
          <p className="legend">Ta progression est sauvegardée sur ton compte : tu la retrouves sur tous tes appareils.</p>
          <button className="btn btn-red btn-small" onClick={() => void signOut()}>
            Se déconnecter
          </button>
        </div>

        <div className="panel">
          <h2 className="panel-title">Installer le jeu</h2>
          {installed ? (
            <p className="legend">✓ Space Brawl est installé sur ton écran d'accueil.</p>
          ) : canInstall ? (
            <>
              <p className="legend">Ajoute le jeu sur ton écran d'accueil : il s'ouvre en plein écran, comme une vraie appli.</p>
              <button className="btn btn-yellow btn-small" onClick={() => void promptInstall()}>
                📲 Installer
              </button>
            </>
          ) : isIos() ? (
            <p className="legend">
              Sur iPhone : ouvre cette page dans <strong>Safari</strong>, touche le bouton <strong>Partager</strong> (le carré avec une
              flèche), puis <strong>« Sur l'écran d'accueil »</strong>.
            </p>
          ) : (
            <p className="legend">
              Sur Android : ouvre le menu <strong>⋮</strong> de Chrome en haut à droite, puis{' '}
              <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »).
            </p>
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">Jeu</h2>
          <div className="row">
            <span>Vibrations</span>
            <button
              className={`toggle ${vibration ? 'on' : ''}`}
              role="switch"
              aria-checked={vibration}
              onClick={toggleVibration}
            >
              <span className="toggle-knob" />
            </button>
          </div>
          <p className="legend">Space Brawl · version 0.1</p>
        </div>
      </div>
    </div>
  );
}
