import { useEffect, useState } from 'react';
import { useGame } from '../lib/GameContext';
import { ConfirmModal } from './Ui';
import type { Kind } from './ItemCard';
import type { Character, Ship } from '../types';

/**
 * Gère l'achat d'un personnage ou d'une soucoupe : fenêtre de confirmation + petit message de réussite.
 * Utilisation : const buy = useBuyFlow();  ...  buy.askBuy('ships', item)  ...  {buy.ui}
 */
export function useBuyFlow() {
  const g = useGame();
  const [target, setTarget] = useState<{ kind: Kind; item: Character | Ship } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  async function confirm() {
    if (!target) return;
    setBusy(true);
    setError(null);
    const err =
      target.kind === 'characters'
        ? await g.buyCharacter(target.item.id)
        : await g.buyShip(target.item.id);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setToast(`${target.item.name} débloqué !`);
    setTarget(null);
  }

  const gems = g.profile?.gems ?? 0;
  const missing = target ? target.item.price - gems : 0;

  const ui = (
    <>
      {target && (
        <ConfirmModal
          title="Débloquer ?"
          confirmLabel={`💎 ${target.item.price.toLocaleString('fr-FR')}`}
          confirmDisabled={missing > 0}
          busy={busy}
          error={error}
          onConfirm={() => void confirm()}
          onClose={() => setTarget(null)}
        >
          <p>
            <strong>{target.item.name}</strong> pour 💎 {target.item.price.toLocaleString('fr-FR')} gemmes.
          </p>
          {missing > 0 ? (
            <p>
              Il te manque 💎 {missing.toLocaleString('fr-FR')} gemmes. Gagne-en en battant un méga boss pour la
              première fois, ou avec le cadeau du jour dans la boutique.
            </p>
          ) : (
            <p>Il te restera 💎 {(gems - target.item.price).toLocaleString('fr-FR')} gemmes.</p>
          )}
        </ConfirmModal>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );

  return {
    askBuy: (kind: Kind, item: Character | Ship) => {
      setError(null);
      setTarget({ kind, item });
    },
    showToast: (message: string) => setToast(message),
    ui,
  };
}
