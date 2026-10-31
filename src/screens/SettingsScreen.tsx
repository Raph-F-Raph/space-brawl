import { useEffect, useState } from 'react';
import { useGame } from '../lib/GameContext';
import { ConfirmModal, TopBar } from '../components/Ui';
import { supabase } from '../lib/supabase';
import { loadSettings, saveSettings } from '../lib/settings';
import { applyAudioSettings, sfx } from '../lib/audio';
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from '../lib/install';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { profile, session, signOut } = useGame();
  const [vibration, setVibration] = useState(loadSettings().vibration);
  const [sound, setSound] = useState(loadSettings().sound);
  const [music, setMusicOn] = useState(loadSettings().music);
  const [canInstall, setCanInstall] = useState(canPromptInstall());
  useEffect(() => onInstallChange(() => setCanInstall(canPromptInstall())), []);
  const installed = isStandalone();
  const [askDelete, setAskDelete] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  async function deleteAccount() {
    setDeleting(true);
    setDelError(null);
    const { error } = await supabase.rpc('delete_account');
    if (error) {
      setDeleting(false);
      setDelError("La suppression n'a pas marché. Réessaie dans un instant.");
      return;
    }
    await signOut();
  }

  function toggleVibration() {
    const next = !vibration;
    setVibration(next);
    saveSettings({ ...loadSettings(), vibration: next });
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    saveSettings({ ...loadSettings(), sound: next });
    if (next) sfx('buy'); // petit son pour montrer que ça marche
  }
  function toggleMusic() {
    const next = !music;
    setMusicOn(next);
    saveSettings({ ...loadSettings(), music: next });
    applyAudioSettings();
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
          <p className="legend">
            <a href="privacy.html" target="_blank" rel="noreferrer">
              Politique de confidentialité
            </a>
          </p>
          <button className="btn btn-grey btn-small" onClick={() => { setTyped(''); setDelError(null); setAskDelete(true); }}>
            Supprimer mon compte
          </button>
        </div>

        {askDelete && (
          <ConfirmModal
            title="Supprimer ton compte ?"
            confirmLabel="Supprimer pour toujours"
            confirmDisabled={typed.trim().toUpperCase() !== 'SUPPRIMER'}
            busy={deleting}
            error={delError}
            onConfirm={() => void deleteAccount()}
            onClose={() => setAskDelete(false)}
          >
            <p>
              Ton compte, tes personnages, tes soucoupes, tes gemmes, tes pièces et ta progression seront effacés définitivement. Tu ne pourras pas les récupérer.
            </p>
            <p>
              Pour confirmer, écris <strong>SUPPRIMER</strong> :
            </p>
            <input className="room-code-input" style={{ width: '100%', letterSpacing: 2, fontSize: 18 }} value={typed} onChange={(e) => setTyped(e.target.value)} />
          </ConfirmModal>
        )}

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
            <span>Bruitages</span>
            <button className={`toggle ${sound ? 'on' : ''}`} role="switch" aria-checked={sound} onClick={toggleSound}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="row">
            <span>Musique</span>
            <button className={`toggle ${music ? 'on' : ''}`} role="switch" aria-checked={music} onClick={toggleMusic}>
              <span className="toggle-knob" />
            </button>
          </div>
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
