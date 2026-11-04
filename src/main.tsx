import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Permet d'installer le jeu sur le téléphone (uniquement sur le site en ligne)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* pas grave si ça échoue */
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
