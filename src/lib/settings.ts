// Réglages simples gardés sur l'appareil (pas besoin de la base de données)
const KEY = 'space-brawl-settings';

export interface Settings {
  vibration: boolean;
}

const defaults: Settings = { vibration: true };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

export function vibrate(ms: number) {
  if (loadSettings().vibration && 'vibrate' in navigator) {
    navigator.vibrate(ms);
  }
}
