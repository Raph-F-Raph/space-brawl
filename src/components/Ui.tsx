import type { CSSProperties, ReactNode } from 'react';
import { CHAPTERS } from '../game/levels';
import { useGame } from '../lib/GameContext';

/** Fond d'espace animé. Ne capte jamais les clics (pointer-events: none). */
export function Backdrop({ theme }: { theme: number }) {
  // theme = nombre de chapitres terminés : l'accueil prend les couleurs du prochain chapitre
  const next = CHAPTERS[theme];
  const vars = (next
    ? { '--bg1': next.theme.bg1, '--bg2': next.theme.bg2 }
    : { '--bg1': '#2b1a00', '--bg2': '#d99a1e' }) as CSSProperties; // tout terminé : or
  return (
    <div className={`backdrop theme-${theme}`} style={vars} aria-hidden="true">
      <div className="stars stars-1" />
      <div className="stars stars-2" />
      <div className="stars stars-3" />
      <div className="planet planet-a" />
      <div className="planet planet-b" />
      {theme >= 1 && <div className="planet planet-c" />}
      {theme >= 1 && <div className="nebula" />}
    </div>
  );
}

export function Currency({ icon, value }: { icon: string; value: number }) {
  return (
    <div className="currency">
      <span className="currency-icon">{icon}</span>
      <span className="currency-value">{value.toLocaleString('fr-FR')}</span>
    </div>
  );
}

/** Barre du haut pour les écrans secondaires : retour + titre + monnaies. */
export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  const { profile } = useGame();
  return (
    <header className="topbar">
      <button className="btn btn-red btn-small" onClick={onBack} aria-label="Retour">
        ◀ Retour
      </button>
      <h1 className="title">{title}</h1>
      <div className="spacer" />
      <Currency icon="🪙" value={profile?.coins ?? 0} />
      <Currency icon="💎" value={profile?.gems ?? 0} />
    </header>
  );
}

export function StatBar({
  label,
  value,
  max,
  color,
  next,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  next?: number; // valeur au niveau suivant (affichée en vert)
}) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="stat-value">
        {value}
        {next !== undefined && next > value && <b className="stat-next"> +{next - value}</b>}
      </span>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="title">{title}</h2>
        <div className="modal-body">{children}</div>
        <button className="btn btn-yellow" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/** Fenêtre « Annuler / Valider » (on ne peut pas utiliser confirm() du navigateur sur mobile en PWA). */
export function ConfirmModal({
  title,
  children,
  confirmLabel,
  confirmDisabled,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="title">{title}</h2>
        <div className="modal-body">
          {children}
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-small btn-grey" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button
            className="btn btn-small btn-yellow"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ComingSoon({ what, onClose }: { what: string; onClose: () => void }) {
  return (
    <Modal title="Bientôt disponible" onClose={onClose}>
      <p>
        <strong>{what}</strong> arrive dans une prochaine mise à jour. 🚀
      </p>
    </Modal>
  );
}
