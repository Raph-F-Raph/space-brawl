// Réglages simples gardés sur l'appareil (pas besoin de la base de données)
const KEY = 'space-brawl-settings';

export interface Settings {
  vibration: boolean;
  sound: boolean; // bruitages
  music: boolean;
}

const defaults: Settings = { vibration: true, sound: true, music: true };
let cached: Settings | null = null;

export function loadSettings(): Settings {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    cached = raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    cached = defaults;
  }
  return cached as Settings;
}

export function saveSettings(s: Settings) {
  cached = s;
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
