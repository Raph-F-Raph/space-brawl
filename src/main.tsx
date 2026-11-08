import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Permet d'installer le jeu sur le téléphone (uniquement sur le site en ligne)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Cherche une nouvelle version à chaque retour dans l'app
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) void reg.update().catch(() => {});
        });
      })
      .catch(() => {
        /* pas grave si ça échoue */
      });
    // Quand une nouvelle version prend le relais, on la charge (sauf en plein niveau)
    let had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!had) {
        had = true;
        return;
      }
      const t = setInterval(() => {
        if (!document.querySelector('.hud, canvas')) {
          clearInterval(t);
          location.reload();
        }
      }, 3000);
    });
  });
}

// Essaie de verrouiller le paysage (marche dans l'app installée / plein écran).
try {
  const lock = () => {
    const o = screen.orientation as ScreenOrientation & { lock?: (t: string) => Promise<void> };
    o?.lock?.('landscape').catch(() => {});
  };
  lock();
  window.addEventListener('pointerdown', lock, { once: true });
} catch {
  /* ignoré */
}
