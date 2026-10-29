// Son du jeu : tout est fabriqué par le téléphone avec WebAudio (aucun fichier à télécharger).
import { loadSettings } from './settings';

type Mode = 'menu' | 'level';

let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let musicBus: GainNode;
let noiseBuf: AudioBuffer | null = null;

// pour les tests automatiques (?debug) : compte les sons demandés
export const audioStats = { sfx: 0, notes: 0 };

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.55;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.2;
    musicBus.connect(master);
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** À appeler dès le premier toucher : les navigateurs interdisent le son avant. */
export function unlockAudio() {
  ensure();
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  to?: number; // fréquence d'arrivée (glissando)
  delay?: number;
  attack?: number;
  bus?: GainNode;
  filter?: number; // coupe-aigus (Hz)
}

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + dur);
  const peak = o.gain ?? 0.3;
  const att = o.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + att);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = osc;
  if (o.filter) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.filter;
    osc.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(o.bus ?? sfxBus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
  audioStats.notes++;
}

function noise(dur: number, o: { gain?: number; delay?: number; freq?: number; type?: BiquadFilterType; bus?: GainNode } = {}) {
  const c = ensure();
  if (!c || !noiseBuf) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'lowpass';
  f.frequency.value = o.freq ?? 1000;
  const g = c.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(o.bus ?? sfxBus);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
  audioStats.notes++;
}

// ---------------------------------------------------------------------
// Bruitages
// ---------------------------------------------------------------------
export type Sfx =
  | 'laser' | 'burst' | 'pierce' | 'shockwave' | 'hit' | 'kill' | 'coin' | 'hurt'
  | 'portal' | 'win' | 'lose' | 'click' | 'boss' | 'buy' | 'bossShot';

const lastPlayed: Partial<Record<Sfx, number>> = {};
const MIN_GAP: Partial<Record<Sfx, number>> = { hit: 0.05, laser: 0.07, burst: 0.1, pierce: 0.1, kill: 0.06, coin: 0.05, hurt: 0.2, bossShot: 0.4 };

export function sfx(name: Sfx) {
  if (!loadSettings().sound) return;
  const c = ensure();
  if (!c) return;
  const now = c.currentTime;
  const gap = MIN_GAP[name] ?? 0;
  if (gap && now - (lastPlayed[name] ?? -1) < gap) return;
  lastPlayed[name] = now;
  audioStats.sfx++;

  switch (name) {
    case 'laser':
      tone(900, 0.13, { type: 'square', to: 320, gain: 0.16, filter: 3500 });
      break;
    case 'burst':
      for (let i = 0; i < 3; i++) tone(700 - i * 60, 0.08, { type: 'sawtooth', to: 260, gain: 0.12, delay: i * 0.035, filter: 3000 });
      break;
    case 'pierce':
      tone(1400, 0.18, { type: 'sine', to: 380, gain: 0.22 });
      tone(700, 0.18, { type: 'triangle', to: 190, gain: 0.12 });
      break;
    case 'shockwave':
      tone(150, 0.4, { type: 'sine', to: 45, gain: 0.5 });
      noise(0.35, { gain: 0.35, freq: 500 });
      break;
    case 'hit':
      noise(0.05, { gain: 0.12, freq: 1800, type: 'bandpass' });
      break;
    case 'kill':
      tone(420, 0.16, { type: 'triangle', to: 110, gain: 0.25 });
      noise(0.12, { gain: 0.18, freq: 900 });
      break;
    case 'coin':
      tone(988, 0.07, { type: 'square', gain: 0.09, filter: 4000 });
      tone(1319, 0.14, { type: 'square', gain: 0.09, delay: 0.06, filter: 4000 });
      break;
    case 'hurt':
      tone(200, 0.28, { type: 'sawtooth', to: 60, gain: 0.3, filter: 1200 });
      noise(0.18, { gain: 0.25, freq: 700 });
      break;
    case 'boss':
      tone(95, 0.9, { type: 'sawtooth', to: 48, gain: 0.35, filter: 600 });
      noise(0.6, { gain: 0.25, freq: 300 });
      break;
    case 'bossShot':
      tone(300, 0.3, { type: 'sine', to: 120, gain: 0.2 });
      break;
    case 'portal':
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.45, { type: 'sine', gain: 0.2, delay: i * 0.09, attack: 0.02 }));
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, { type: 'triangle', gain: 0.28, delay: i * 0.13 }));
      tone(1047, 0.8, { type: 'triangle', gain: 0.25, delay: 0.55 });
      break;
    case 'lose':
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.4, { type: 'sawtooth', gain: 0.16, delay: i * 0.18, filter: 1400 }));
      break;
    case 'click':
      tone(640, 0.05, { type: 'triangle', gain: 0.18 });
      break;
    case 'buy':
      [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.18, { type: 'square', gain: 0.1, delay: i * 0.07, filter: 4000 }));
      break;
  }
}

// ---------------------------------------------------------------------
// Musique : boucle fabriquée en direct (accords + arpège, + basse et rythme dans les niveaux)
// ---------------------------------------------------------------------
const ROOTS = [110, 87.31, 130.81, 98]; // La, Fa, Do, Sol (graves)
const CHORDS = [
  [0, 3, 7], // La mineur
  [0, 4, 7], // Fa majeur
  [0, 4, 7], // Do majeur
  [0, 4, 7], // Sol majeur
];
const hz = (root: number, semis: number) => root * Math.pow(2, semis / 12);

let wanted: Mode | null = null;
let running: Mode | null = null;
let timer: number | undefined;
let session: GainNode | null = null;
let nextTime = 0;
let step = 0;

function scheduleStep(mode: Mode, st: number, t: number, sixteenth: number, bus: GainNode) {
  const bar = Math.floor(st / 16) % 4;
  const inBar = st % 16;
  const root = ROOTS[bar];
  const chord = CHORDS[bar];
  const delay = Math.max(0, t - (ctx as AudioContext).currentTime);
  const barLen = sixteenth * 16;

  if (inBar === 0) {
    // nappe : l'accord tenu toute la mesure
    for (const s of chord) tone(hz(root * 2, s), barLen * 0.98, { type: 'sine', gain: mode === 'menu' ? 0.2 : 0.14, delay, attack: 0.25, bus });
  }
  // arpège (plus dense dans les niveaux)
  const every = mode === 'menu' ? 4 : 2;
  if (inBar % every === 0) {
    const idx = (inBar / every) % chord.length;
    const oct = mode === 'menu' ? 4 : 4;
    tone(hz(root * oct, chord[idx]), sixteenth * every * 0.9, { type: 'triangle', gain: mode === 'menu' ? 0.12 : 0.1, delay, bus, filter: 2800 });
  }
  if (mode === 'level') {
    // basse sur chaque temps + grosse caisse + charleston sur les contretemps
    if (inBar % 4 === 0) {
      tone(hz(root, 0), sixteenth * 3.4, { type: 'sawtooth', gain: 0.17, delay, bus, filter: 500 });
      tone(120, 0.12, { type: 'sine', to: 40, gain: 0.38, delay, bus });
    }
    if (inBar % 4 === 2) noise(0.04, { gain: 0.09, delay, freq: 7000, type: 'highpass', bus });
  }
}

function tick() {
  const c = ctx;
  if (!c || !running || !session) return;
  const mode = running;
  const sixteenth = 60 / (mode === 'menu' ? 84 : 122) / 4;
  while (nextTime < c.currentTime + 0.35) {
    scheduleStep(mode, step, nextTime, sixteenth, session);
    nextTime += sixteenth;
    step++;
  }
}

function stopRunning() {
  if (timer !== undefined) {
    clearInterval(timer);
    timer = undefined;
  }
  const c = ctx;
  const s = session;
  if (c && s) {
    s.gain.cancelScheduledValues(c.currentTime);
    s.gain.setValueAtTime(s.gain.value, c.currentTime);
    s.gain.linearRampToValueAtTime(0, c.currentTime + 0.3);
    setTimeout(() => s.disconnect(), 450);
  }
  session = null;
  running = null;
}

function startRunning(mode: Mode) {
  const c = ensure();
  if (!c) return;
  stopRunning();
  running = mode;
  session = c.createGain();
  session.gain.value = 1;
  session.connect(musicBus);
  nextTime = c.currentTime + 0.1;
  step = 0;
  tick();
  timer = window.setInterval(tick, 120);
}

/** Choisit la musique voulue ; elle ne joue que si la musique est activée dans les réglages. */
export function setMusic(mode: Mode | null) {
  wanted = mode;
  applyAudioSettings();
}

/** À rappeler quand les réglages changent. */
export function applyAudioSettings() {
  const on = loadSettings().music && wanted !== null && !document.hidden;
  if (on && wanted) {
    if (running !== wanted) startRunning(wanted);
  } else if (running) {
    stopRunning();
  }
}

if (typeof document !== 'undefined') {
  // pas de musique quand l'appli est en arrière-plan
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) void ctx?.suspend();
    else void ctx?.resume();
    applyAudioSettings();
  });
}
