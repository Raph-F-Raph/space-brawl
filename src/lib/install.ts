// Installation du jeu sur l'écran d'accueil (PWA).
// Android/Chrome envoie un évènement "beforeinstallprompt" qu'on garde pour proposer un vrai bouton.
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  // l'évènement a pu arriver avant le chargement du jeu : index.html le garde dans window.__installEvent
  deferred = ((window as unknown as { __installEvent?: InstallEvent }).__installEvent ?? null) as InstallEvent | null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function canPromptInstall(): boolean {
  return deferred !== null;
}
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  listeners.forEach((l) => l());
  return outcome === 'accepted';
}
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
