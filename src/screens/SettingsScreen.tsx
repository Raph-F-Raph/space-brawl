import { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { TopBar } from '../components/Ui';
import { loadSettings, saveSettings } from '../lib/settings';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { profile, session, signOut } = useGame();
  const [vibration, setVibration] = useState(loadSettings().vibration);

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
