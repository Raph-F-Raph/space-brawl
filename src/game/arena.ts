import type { AttackKind } from '../types';
import type { PlayerStats } from './engine';
import { vibrate } from '../lib/settings';
import { sfx } from '../lib/audio';

// Battle Royale : 8 pilotes (toi + 7 robots) dans une grande arène, une zone se referme, le dernier en vie gagne.
// Les robots utilisent la même structure que les vrais joueurs : plus tard on pourra les remplacer par de vrais joueurs en ligne.

export const AW = 960; // taille de l'écran logique (comme les niveaux)
export const AH = 540;
export const WORLD = 1900; // taille de l'arène
const TAU = Math.PI * 2;
const R = 18;
const COUNT = 8;
const ZONE_START = 1000;
const ZONE_END = 110;
const ZONE_WAIT = 25; // secondes avant que la zone commence à rétrécir
const ZONE_SHRINK = 130; // durée du rétrécissement

const BOT_NAMES = ['Zorg', 'Nébula', 'Kiko', 'Astro', 'Pulsar', 'Mika', 'Orion', 'Vega', 'Luna', 'Rocket'];
const BOT_COLORS: [string, string, string][] = [
  ['#ff6b9d', '#fff3b0', '#9d4edd'],
  ['#4cc9f0', '#ffd23f', '#4895ef'],
  ['#b5f23d', '#3a0ca3', '#7bf1a8'],
  ['#ff9f1c', '#2b2d42', '#ff5d8f'],
  ['#c1121f', '#ffd166', '#9d0208'],
  ['#a8dadc', '#1d3557', '#caf0f8'],
  ['#7b2cbf', '#7ef9ff', '#3a0ca3'],
  ['#2ec4b6', '#fff3b0', '#e0e7ff'],
];
const KINDS: AttackKind[] = ['laser', 'burst', 'pierce', 'shockwave', 'spread'];

export interface InputMsg {
  jx: number;
  jy: number;
  fire: boolean;
  ax: number | null;
  ay: number | null;
}
export interface PilotInfo {
  id: number;
  name: string;
  human: boolean;
  charColor: string;
  charAccent: string;
  shipColor: string;
  shipAccent: string;
  maxHp: number;
  kind: AttackKind;
}
export interface StartMsg {
  seed: number;
  pilots: PilotInfo[];
}
export interface StateMsg {
  t: number;
  z: number;
  p: number[][]; // [id, x, y, hp, facing, vivant, éliminations, flash, invulnérable]
  b: number[][]; // [x, y, vx, vy, rayon, propriétaire]
  r: number[][]; // [x, y, portée, vie restante, propriétaire]
}
export interface ResultMsg {
  id: number;
  place: number;
  kills: number;
}
export interface ArenaNet {
  sendState(s: StateMsg): void; // hôte -> invités
  sendInput(i: InputMsg): void; // invité -> hôte
  sendResult(r: ResultMsg): void; // hôte -> invité éliminé
}
export interface HumanSlot {
  id: number;
  name: string;
  stats: PlayerStats;
}
export interface ArenaOptions {
  mode: 'solo' | 'host' | 'guest';
  myId: number;
  seed: number;
  humans: HumanSlot[]; // solo / hôte : les vrais joueurs (ids 0, 1, 2…)
  start?: StartMsg; // invité : description des 8 pilotes envoyée par l'hôte
  net?: ArenaNet;
}

interface Pilot {
  id: number;
  name: string;
  isPlayer: boolean; // c'est moi (sur cet appareil)
  human: boolean;
  input: InputMsg | null;
  inputAt: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  reduction: number;
  kind: AttackKind;
  charColor: string;
  charAccent: string;
  shipColor: string;
  shipAccent: string;
  facing: number;
  cd: number;
  invuln: number;
  alive: boolean;
  kills: number;
  // intelligence artificielle
  wx: number;
  wy: number;
  retarget: number;
  strafe: number;
  flash: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dmg: number;
  life: number;
  owner: number;
  pierce: boolean;
  hit: Set<number>;
  color: string;
}

interface Rock {
  x: number;
  y: number;
  r: number;
  rot: number;
}

export interface ArenaHud {
  hp: number;
  maxHp: number;
  alive: number;
  kills: number;
  zoneText: string;
  outside: boolean;
}

export interface ArenaResult {
  place: number;
  kills: number;
  won: boolean;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ArenaEngine {
  keys = new Set<string>();
  joy = { x: 0, y: 0 };
  fireBtn = false;
  aim: { x: number; y: number } | null = null;
  paused = false;

  private ctx: CanvasRenderingContext2D;
  private cw = AW;
  private ch = AH;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private running = false;
  private ended = false; // mon résultat est connu
  private matchOver = false; // il ne reste qu'un pilote (hôte / solo)
  private overT = 0;
  private time = 0;
  private pilots: Pilot[] = [];
  private bullets: Bullet[] = [];
  private rocks: Rock[] = [];
  private rings: { x: number; y: number; max: number; life: number; color: string; owner?: number }[] = [];
  private stars: { x: number; y: number; r: number }[] = [];
  private cam = { x: 0, y: 0 };
  private zoneR = ZONE_START;
  private dmgTick = 0;
  private placed = new Set<number>();
  private netT = 0;
  private inputT = 0;
  private lastFire = false;
  private snapAt = 0;
  private snapB: number[][] = [];
  private snapR: number[][] = [];
  private gotSnap = false;
  private myId: number;
  private mode: 'solo' | 'host' | 'guest';
  private net?: ArenaNet;

  constructor(
    private canvas: HTMLCanvasElement,
    opts: ArenaOptions,
    private onHud: (h: ArenaHud) => void,
    private onEnd: (r: ArenaResult) => void
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non supporté');
    this.ctx = ctx;
    this.mode = opts.mode;
    this.myId = opts.myId;
    this.net = opts.net;
    const rnd = mulberry32(opts.seed);
    this.makeRocks(rnd);
    for (let i = 0; i < 260; i++) this.stars.push({ x: Math.random() * WORLD, y: Math.random() * WORLD, r: 0.6 + Math.random() * 1.6 });

    if (opts.mode === 'guest' && opts.start) {
      // l'hôte décide de tout : on reçoit juste l'apparence des pilotes
      for (const info of opts.start.pilots) {
        const pl = this.makePilot(
          info.id,
          info.name,
          info.id === this.myId,
          WORLD / 2,
          WORLD / 2,
          { maxHp: info.maxHp, damage: 0, reduction: 0, speed: 0, attackKind: info.kind, charColor: info.charColor, charAccent: info.charAccent, shipColor: info.shipColor, shipAccent: info.shipAccent }
        );
        pl.human = info.human;
        this.pilots.push(pl);
      }
      return;
    }

    // Les 8 pilotes partent en cercle autour du centre : les vrais joueurs d'abord, puis les robots
    const names = [...BOT_NAMES].sort(() => Math.random() - 0.5);
    const start = rnd() * TAU;
    const humans = opts.humans;
    for (let i = 0; i < COUNT; i++) {
      const a = start + (i / COUNT) * TAU;
      const px = WORLD / 2 + Math.cos(a) * 650;
      const py = WORLD / 2 + Math.sin(a) * 650;
      const h = humans.find((x) => x.id === i);
      if (h) {
        const pl = this.makePilot(i, h.name, i === this.myId, px, py, h.stats);
        pl.human = true;
        this.pilots.push(pl);
      } else {
        const [cc, ca, sc] = BOT_COLORS[i % BOT_COLORS.length];
        const hpBase = 130 + Math.random() * 60;
        this.pilots.push(
          this.makePilot(i, names[i], false, px, py, {
            maxHp: Math.round(hpBase),
            damage: 9 + Math.random() * 5,
            reduction: 2 + Math.random() * 3,
            speed: 200 + Math.random() * 60,
            attackKind: KINDS[Math.floor(Math.random() * KINDS.length)],
            charColor: cc,
            charAccent: ca,
            shipColor: sc,
            shipAccent: ca,
          })
        );
      }
    }
  }

  /** Description des pilotes à envoyer aux invités quand l'hôte lance la partie. */
  describe(): PilotInfo[] {
    return this.pilots.map((p) => ({
      id: p.id,
      name: p.name,
      human: p.human,
      charColor: p.charColor,
      charAccent: p.charAccent,
      shipColor: p.shipColor,
      shipAccent: p.shipAccent,
      maxHp: p.maxHp,
      kind: p.kind,
    }));
  }

  private makePilot(id: number, name: string, isPlayer: boolean, x: number, y: number, s: PlayerStats): Pilot {
    return {
      id,
      name,
      isPlayer,
      human: false,
      input: null,
      inputAt: 0,
      x,
      y,
      tx: x,
      ty: y,
      hp: s.maxHp,
      maxHp: s.maxHp,
      speed: s.speed,
      damage: s.damage,
      reduction: s.reduction,
      kind: s.attackKind,
      charColor: s.charColor,
      charAccent: s.charAccent,
      shipColor: s.shipColor,
      shipAccent: s.shipAccent,
      facing: Math.atan2(WORLD / 2 - y, WORLD / 2 - x),
      cd: 0.5 + Math.random(),
      invuln: 0,
      alive: true,
      kills: 0,
      wx: WORLD / 2,
      wy: WORLD / 2,
      retarget: 0,
      strafe: Math.random() < 0.5 ? 1 : -1,
      flash: 0,
    };
  }

  private makeRocks(rnd: () => number) {
    let guard = 0;
    while (this.rocks.length < 16 && guard++ < 500) {
      const r = 34 + rnd() * 36;
      const x = 150 + rnd() * (WORLD - 300);
      const y = 150 + rnd() * (WORLD - 300);
      if (Math.hypot(x - WORLD / 2, y - WORLD / 2) > 800) continue;
      if (Math.hypot(x - WORLD / 2, y - WORLD / 2) < 140) continue;
      if (this.rocks.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r + 160)) continue;
      this.rocks.push({ x, y, r, rot: rnd() * TAU });
    }
  }

  start() {
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize(cssW: number, cssH: number, dpr: number) {
    this.cw = cssW;
    this.ch = cssH;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(cssW * dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * dpr));
    this.render();
  }

  private loop = (t: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    if (!this.paused) {
      if (this.mode === 'guest') this.guestStep(dt);
      else if (!(this.mode === 'solo' && this.ended)) this.update(dt);
    }
    this.updateCamera();
    this.render();
    this.onHud(this.hud());
    this.raf = requestAnimationFrame(this.loop);
  };

  private me(): Pilot {
    return this.pilots.find((x) => x.id === this.myId) ?? this.pilots[0];
  }

  private updateCamera() {
    const me = this.me();
    if (!me) return;
    this.cam.x = clamp(me.x - AW / 2, 0, WORLD - AW);
    this.cam.y = clamp(me.y - AH * 0.5, 0, WORLD - AH);
  }

  private hud(): ArenaHud {
    const p = this.me();
    const out = this.outside(p);
    const wait = ZONE_WAIT - this.time;
    return {
      hp: Math.max(0, Math.ceil(p.hp)),
      maxHp: p.maxHp,
      alive: this.pilots.filter((x) => x.alive).length,
      kills: p.kills,
      outside: out && p.alive,
      zoneText: wait > 0 ? `Zone dans ${Math.ceil(wait)} s` : this.zoneR <= ZONE_END + 2 ? 'Zone finale !' : 'La zone se referme',
    };
  }

  private outside(p: Pilot) {
    return Math.hypot(p.x - WORLD / 2, p.y - WORLD / 2) > this.zoneR;
  }

  // ------------------------------------------------------------------
  // Réseau : l'hôte calcule tout, les invités envoient leurs commandes et affichent ce que l'hôte leur envoie
  // ------------------------------------------------------------------
  /** (hôte) commande reçue d'un invité */
  applyInput(id: number, input: InputMsg) {
    const p = this.pilots.find((x) => x.id === id);
    if (!p) return;
    p.input = input;
    p.inputAt = this.time;
  }

  /** (invité) photo de la partie envoyée par l'hôte */
  applyState(m: StateMsg) {
    const first = !this.gotSnap;
    this.gotSnap = true;
    this.snapAt = performance.now();
    this.time = m.t;
    this.zoneR = m.z;
    for (const e of m.p) {
      const p = this.pilots.find((x) => x.id === e[0]);
      if (!p) continue;
      if (p.isPlayer && e[3] < p.hp && p.alive) {
        sfx('hurt');
        vibrate(30);
      }
      p.tx = e[1];
      p.ty = e[2];
      if (first || (p.alive && !e[5])) {
        p.x = e[1];
        p.y = e[2];
      }
      p.hp = e[3];
      p.facing = e[4];
      p.alive = e[5] === 1;
      p.kills = e[6];
      p.flash = e[7] ? 0.1 : 0;
      p.invuln = e[8] ? 0.1 : 0;
    }
    this.snapB = m.b;
    this.snapR = m.r;
  }

  /** (invité) l'hôte m'annonce mon classement final */
  applyResult(r: ResultMsg) {
    if (r.id === this.myId) this.finishLocal(r.place, r.kills);
  }

  private guestStep(dt: number) {
    for (const p of this.pilots) {
      p.x += (p.tx - p.x) * Math.min(1, dt * 14);
      p.y += (p.ty - p.y) * Math.min(1, dt * 14);
    }
    const age = (performance.now() - this.snapAt) / 1000;
    this.bullets = this.snapB.map((b) => {
      const owner = this.pilots.find((x) => x.id === b[5]);
      return {
        x: b[0] + b[2] * age,
        y: b[1] + b[3] * age,
        vx: b[2],
        vy: b[3],
        r: b[4],
        dmg: 0,
        life: 1,
        owner: b[5],
        pierce: false,
        hit: new Set<number>(),
        color: owner?.isPlayer ? '#7df9ff' : owner?.charAccent ?? '#fff',
      };
    });
    this.rings = this.snapR.map((r) => {
      const owner = this.pilots.find((x) => x.id === r[4]);
      return { x: r[0], y: r[1], max: r[2], life: Math.max(0.001, r[3] - age), color: owner?.isPlayer ? '#7df9ff' : owner?.charAccent ?? '#fff' };
    });
    // j'envoie mes commandes à l'hôte (10 fois par seconde, et tout de suite quand j'appuie sur tirer)
    this.inputT += dt;
    const inp = this.localInput();
    if (inp.fire !== this.lastFire || this.inputT >= 0.1) {
      this.inputT = 0;
      this.lastFire = inp.fire;
      this.net?.sendInput(inp);
    }
  }

  private sendSnapshot() {
    const m: StateMsg = {
      t: Math.round(this.time * 100) / 100,
      z: Math.round(this.zoneR),
      p: this.pilots.map((p) => [p.id, Math.round(p.x), Math.round(p.y), Math.round(p.hp), Math.round(p.facing * 100) / 100, p.alive ? 1 : 0, p.kills, p.flash > 0 ? 1 : 0, p.invuln > 0 ? 1 : 0]),
      b: this.bullets.slice(0, 160).map((b) => [Math.round(b.x), Math.round(b.y), Math.round(b.vx), Math.round(b.vy), b.r, b.owner]),
      r: this.rings.map((r) => [Math.round(r.x), Math.round(r.y), r.max, Math.round(r.life * 100) / 100, r.owner ?? -1]),
    };
    this.net?.sendState(m);
  }

  // ------------------------------------------------------------------
  private update(dt: number) {
    this.time += dt;
    // la zone
    const k = clamp((this.time - ZONE_WAIT) / ZONE_SHRINK, 0, 1);
    this.zoneR = ZONE_START + (ZONE_END - ZONE_START) * k;

    this.dmgTick += dt;
    const tick = this.dmgTick >= 0.5;
    if (tick) this.dmgTick = 0;

    for (const p of this.pilots) {
      if (!p.alive) continue;
      p.invuln = Math.max(0, p.invuln - dt);
      p.flash = Math.max(0, p.flash - dt);
      p.cd = Math.max(0, p.cd - dt);
      if (p.isPlayer) {
        const li = this.localInput();
        this.humanControl(p, li, dt);
      } else if (p.human) {
        const stale = !p.input || this.time - p.inputAt > 2;
        this.humanControl(p, stale ? { jx: 0, jy: 0, fire: false, ax: null, ay: null } : (p.input as InputMsg), dt);
      } else this.botControl(p, dt);
      // obstacles : on est repoussé
      for (const r of this.rocks) {
        const d = Math.hypot(p.x - r.x, p.y - r.y);
        const min = r.r + R;
        if (d < min && d > 0) {
          p.x = r.x + ((p.x - r.x) / d) * min;
          p.y = r.y + ((p.y - r.y) / d) * min;
        }
      }
      p.x = clamp(p.x, R, WORLD - R);
      p.y = clamp(p.y, R, WORLD - R);
      // hors de la zone : dégâts
      if (tick && this.outside(p)) this.damage(p, Math.max(3, Math.round(p.maxHp * 0.03 + (this.time > ZONE_WAIT + ZONE_SHRINK * 0.6 ? 3 : 0))), -1, true);
    }

    // tirs
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.x < 0 || b.y < 0 || b.x > WORLD || b.y > WORLD) b.life = 0;
      for (const r of this.rocks) if (Math.hypot(b.x - r.x, b.y - r.y) < r.r * 0.9 + b.r) b.life = 0;
      for (const p of this.pilots) {
        if (!p.alive || p.id === b.owner || b.hit.has(p.id)) continue;
        if (Math.hypot(b.x - p.x, b.y - p.y) < R + b.r) {
          this.damage(p, b.dmg, b.owner, false);
          b.hit.add(p.id);
          if (!b.pierce) b.life = 0;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
    for (const rg of this.rings) rg.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);

    // classements : chaque vrai joueur éliminé connaît sa place, le dernier en vie gagne
    const alive = this.pilots.filter((x) => x.alive);
    for (const h of this.pilots) {
      if (!h.human || this.placed.has(h.id)) continue;
      if (!h.alive) this.place(h, alive.length + 1);
      else if (alive.length === 1) this.place(h, 1);
    }
    if (alive.length <= 1 && !this.matchOver) this.matchOver = true;

    // l'hôte envoie une photo de la partie 12 fois par seconde
    if (this.mode === 'host') {
      this.netT += dt;
      if (this.netT >= 0.083 || (this.matchOver && this.overT === 0)) {
        this.netT = 0;
        this.sendSnapshot();
      }
      if (this.matchOver) {
        this.overT += dt;
        if (this.overT > 2) this.ended = true;
      }
    }
  }

  private place(h: Pilot, place: number) {
    this.placed.add(h.id);
    if (h.isPlayer) this.finishLocal(place, h.kills);
    else this.net?.sendResult({ id: h.id, place, kills: h.kills });
  }

  private finishLocal(place: number, kills: number) {
    if (this.ended && this.mode !== 'host') return;
    if (this.mode !== 'host') this.ended = true;
    const won = place === 1;
    sfx(won ? 'win' : 'lose');
    this.onEnd({ place, kills, won });
  }

  // ------------------------------------------------------------------
  /** Les commandes de l'appareil : joystick, clavier, bouton de tir. */
  private localInput(): InputMsg {
    let mx = this.joy.x;
    let my = this.joy.y;
    const kx = (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) - (this.keys.has('q') || this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0);
    const ky = (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) - (this.keys.has('z') || this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0);
    if (kx || ky) {
      const m = Math.hypot(kx, ky);
      mx = kx / m;
      my = ky / m;
    } else {
      const jm = Math.hypot(mx, my);
      if (jm > 1) {
        mx /= jm;
        my /= jm;
      }
    }
    return {
      jx: Math.round(mx * 100) / 100,
      jy: Math.round(my * 100) / 100,
      fire: this.fireBtn || this.keys.has(' '),
      ax: this.aim ? Math.round(this.aim.x * 100) / 100 : null,
      ay: this.aim ? Math.round(this.aim.y * 100) / 100 : null,
    };
  }

  /** Un vrai joueur (moi, ou un invité à distance) : mêmes règles pour tout le monde. */
  private humanControl(p: Pilot, inp: InputMsg, dt: number) {
    const mx = inp.jx;
    const my = inp.jy;
    p.x += mx * p.speed * dt;
    p.y += my * p.speed * dt;
    const target = this.nearestEnemy(p, 560);
    if (inp.ax !== null && inp.ay !== null) p.facing = Math.atan2(inp.ay, inp.ax);
    else if (target) p.facing = Math.atan2(target.y - p.y, target.x - p.x);
    else if (mx || my) p.facing = Math.atan2(my, mx);
    if (inp.fire && p.cd <= 0) this.attack(p);
  }

  private botControl(p: Pilot, dt: number) {
    p.retarget -= dt;
    const target = this.nearestEnemy(p, 700);
    const cx = WORLD / 2;
    const cy = WORLD / 2;
    const dc = Math.hypot(p.x - cx, p.y - cy);
    let mx = 0;
    let my = 0;
    // 1) la zone est prioritaire
    if (dc > this.zoneR - 90) {
      mx = cx - p.x;
      my = cy - p.y;
    } else if (target) {
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const d = Math.hypot(dx, dy);
      const want = p.kind === 'shockwave' ? 90 : 230;
      if (d > want + 60) {
        mx = dx;
        my = dy;
      } else if (d < want - 60) {
        mx = -dx;
        my = -dy;
      } else {
        mx = -dy * p.strafe;
        my = dx * p.strafe;
      }
      if (p.retarget <= 0) {
        p.retarget = 1 + Math.random() * 2;
        p.strafe = Math.random() < 0.5 ? 1 : -1;
      }
    } else {
      // il se promène vers un point au hasard à l'intérieur de la zone
      if (p.retarget <= 0 || Math.hypot(p.wx - p.x, p.wy - p.y) < 40) {
        const a = Math.random() * TAU;
        const rr = Math.random() * Math.max(60, this.zoneR - 120);
        p.wx = cx + Math.cos(a) * rr;
        p.wy = cy + Math.sin(a) * rr;
        p.retarget = 3 + Math.random() * 3;
      }
      mx = p.wx - p.x;
      my = p.wy - p.y;
    }
    const m = Math.hypot(mx, my);
    if (m > 0) {
      p.x += (mx / m) * p.speed * 0.85 * dt;
      p.y += (my / m) * p.speed * 0.85 * dt;
    }
    if (target) {
      const d = Math.hypot(target.x - p.x, target.y - p.y);
      p.facing = Math.atan2(target.y - p.y, target.x - p.x) + (Math.random() - 0.5) * 0.22;
      const range = p.kind === 'shockwave' ? 110 : 460;
      if (d < range && p.cd <= 0) this.attack(p, 1.8); // les robots tirent moins vite que toi
    }
  }

  private nearestEnemy(from: Pilot, range: number): Pilot | null {
    let best: Pilot | null = null;
    let bd = range;
    for (const o of this.pilots) {
      if (!o.alive || o.id === from.id) continue;
      const d = Math.hypot(o.x - from.x, o.y - from.y);
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return best;
  }

  private shoot(p: Pilot, angle: number, speed: number, dmg: number, r: number, pierce: boolean) {
    this.bullets.push({
      x: p.x + Math.cos(angle) * 24,
      y: p.y + Math.sin(angle) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      dmg,
      life: 1.3,
      owner: p.id,
      pierce,
      hit: new Set(),
      color: p.isPlayer ? '#7df9ff' : p.charAccent,
    });
  }

  private attack(p: Pilot, slow = 1) {
    const f = p.facing;
    const d = p.damage;
    let cd = 0.4;
    switch (p.kind) {
      case 'laser':
        this.shoot(p, f, 540, d, 7, false);
        cd = 0.34;
        if (p.isPlayer) sfx('laser');
        break;
      case 'burst':
        for (const o of [-0.14, 0, 0.14]) this.shoot(p, f + o, 560, d * 0.62, 6, false);
        cd = 0.5;
        if (p.isPlayer) sfx('burst');
        break;
      case 'spread':
        for (const o of [-0.32, -0.16, 0, 0.16, 0.32]) this.shoot(p, f + o, 500, d * 0.5, 5, false);
        cd = 0.62;
        if (p.isPlayer) sfx('burst');
        break;
      case 'pierce':
        this.shoot(p, f, 640, d * 0.9, 9, true);
        cd = 0.5;
        if (p.isPlayer) sfx('pierce');
        break;
      case 'shockwave': {
        const range = 125;
        this.rings.push({ x: p.x, y: p.y, max: range, life: 0.35, color: p.isPlayer ? '#7df9ff' : p.charAccent, owner: p.id });
        for (const o of this.pilots) {
          if (!o.alive || o.id === p.id) continue;
          const dist = Math.hypot(o.x - p.x, o.y - p.y);
          if (dist < range + R) {
            this.damage(o, d * 1.3, p.id, false);
            if (dist > 0) {
              o.x += ((o.x - p.x) / dist) * 30;
              o.y += ((o.y - p.y) / dist) * 30;
            }
          }
        }
        cd = 0.85;
        if (p.isPlayer) sfx('shockwave');
        break;
      }
    }
    p.cd = cd * slow;
  }

  private damage(p: Pilot, base: number, by: number, zone: boolean) {
    if (!p.alive) return;
    if (!zone && p.invuln > 0) return;
    const dmg = zone ? base : Math.max(1, Math.round(base - p.reduction));
    p.hp -= dmg;
    p.flash = 0.1;
    if (!zone) p.invuln = 0.08;
    if (p.isPlayer) {
      sfx('hurt');
      vibrate(30);
    } else if (by === this.myId) {
      sfx('hit');
    }
    if (p.hp <= 0) {
      p.alive = false;
      p.hp = 0;
      const killer = this.pilots.find((x) => x.id === by);
      if (killer) killer.kills++;
      if (by === this.myId) sfx('kill');
    }
  }

  // ------------------------------------------------------------------
  private render() {
    const c = this.ctx;
    const dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#04061a';
    c.fillRect(0, 0, this.cw, this.ch);
    const sc = Math.min(this.cw / AW, this.ch / AH);
    const ox = (this.cw - AW * sc) / 2;
    const oy = (this.ch - AH * sc) / 2;
    c.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    c.save();
    c.beginPath();
    c.rect(0, 0, AW, AH);
    c.clip();

    const g = c.createRadialGradient(AW / 2, AH / 2, 40, AW / 2, AH / 2, AW * 0.65);
    g.addColorStop(0, '#16206b');
    g.addColorStop(1, '#070b2e');
    c.fillStyle = g;
    c.fillRect(0, 0, AW, AH);

    c.save();
    c.translate(-this.cam.x, -this.cam.y);
    const cx0 = this.cam.x;
    const cy0 = this.cam.y;

    // étoiles + quadrillage
    c.fillStyle = '#fff';
    for (const s of this.stars) {
      if (s.x < cx0 - 4 || s.x > cx0 + AW + 4 || s.y < cy0 - 4 || s.y > cy0 + AH + 4) continue;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,0.05)';
    c.lineWidth = 1;
    c.beginPath();
    for (let x = Math.floor(cx0 / 80) * 80; x <= cx0 + AW; x += 80) {
      c.moveTo(x, cy0);
      c.lineTo(x, cy0 + AH);
    }
    for (let y = Math.floor(cy0 / 80) * 80; y <= cy0 + AH; y += 80) {
      c.moveTo(cx0, y);
      c.lineTo(cx0 + AW, y);
    }
    c.stroke();

    // bord de l'arène
    c.strokeStyle = 'rgba(255,255,255,0.25)';
    c.lineWidth = 6;
    c.strokeRect(0, 0, WORLD, WORLD);

    // astéroïdes
    for (const r of this.rocks) {
      if (r.x + r.r < cx0 || r.x - r.r > cx0 + AW || r.y + r.r < cy0 || r.y - r.r > cy0 + AH) continue;
      c.save();
      c.translate(r.x, r.y);
      c.fillStyle = '#6d6a85';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0, 0, r.r, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.2)';
      c.beginPath();
      c.arc(r.r * 0.25, r.r * 0.2, r.r * 0.35, 0, TAU);
      c.arc(-r.r * 0.35, -r.r * 0.25, r.r * 0.2, 0, TAU);
      c.fill();
      c.restore();
    }

    // zone : tout ce qui est à l'extérieur du cercle est rouge sombre
    c.save();
    c.beginPath();
    c.rect(cx0 - 10, cy0 - 10, AW + 20, AH + 20);
    c.moveTo(WORLD / 2 + this.zoneR, WORLD / 2);
    c.arc(WORLD / 2, WORLD / 2, this.zoneR, 0, TAU, true);
    c.fillStyle = 'rgba(190,20,60,0.32)';
    c.fill('evenodd');
    c.strokeStyle = '#ff4d6d';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(WORLD / 2, WORLD / 2, this.zoneR, 0, TAU);
    c.stroke();
    c.restore();

    // ondes de choc
    for (const rg of this.rings) {
      const t = 1 - rg.life / 0.35;
      c.strokeStyle = rg.color;
      c.globalAlpha = 1 - t;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(rg.x, rg.y, rg.max * t, 0, TAU);
      c.stroke();
    }
    c.globalAlpha = 1;

    // tirs
    for (const b of this.bullets) {
      c.fillStyle = b.color;
      c.strokeStyle = '#0b1030';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(b.x, b.y, b.r, 0, TAU);
      c.fill();
      c.stroke();
    }

    // pilotes
    for (const p of this.pilots) if (p.alive) this.drawPilot(p);

    c.restore();

    // flèche vers la zone quand on est dehors
    const me = this.me();
    if (me.alive && this.outside(me)) {
      const a = Math.atan2(WORLD / 2 - me.y, WORLD / 2 - me.x);
      c.save();
      c.translate(AW / 2 + Math.cos(a) * 110, AH / 2 + Math.sin(a) * 110);
      c.rotate(a);
      c.fillStyle = '#ffd23f';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(18, 0);
      c.lineTo(-10, -12);
      c.lineTo(-10, 12);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }

    // mini-carte
    const mm = 86;
    const mx0 = 14;
    const my0 = 64;
    c.fillStyle = 'rgba(5,8,40,0.65)';
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 2;
    c.fillRect(mx0, my0, mm, mm);
    c.strokeRect(mx0, my0, mm, mm);
    const k = mm / WORLD;
    c.strokeStyle = '#ff4d6d';
    c.beginPath();
    c.arc(mx0 + (WORLD / 2) * k, my0 + (WORLD / 2) * k, this.zoneR * k, 0, TAU);
    c.stroke();
    for (const p of this.pilots) {
      if (!p.alive) continue;
      c.fillStyle = p.isPlayer ? '#7df9ff' : '#ffd23f';
      c.beginPath();
      c.arc(mx0 + p.x * k, my0 + p.y * k, p.isPlayer ? 3.5 : 2.5, 0, TAU);
      c.fill();
    }

    if (me.alive && this.outside(me)) {
      const v = c.createRadialGradient(AW / 2, AH / 2, AH * 0.35, AW / 2, AH / 2, AW * 0.6);
      v.addColorStop(0, 'rgba(255,0,60,0)');
      v.addColorStop(1, 'rgba(255,0,60,0.35)');
      c.fillStyle = v;
      c.fillRect(0, 0, AW, AH);
    }
    c.restore();
  }

  private drawPilot(p: Pilot) {
    const c = this.ctx;
    c.save();
    c.translate(p.x, p.y);
    c.lineJoin = 'round';
    // ligne de visée du joueur
    if (p.isPlayer) {
      c.strokeStyle = 'rgba(125,249,255,0.35)';
      c.lineWidth = 2;
      c.setLineDash([6, 8]);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(p.facing) * 90, Math.sin(p.facing) * 90);
      c.stroke();
      c.setLineDash([]);
    }
    if (p.invuln > 0 && p.isPlayer && Math.floor(this.time * 20) % 2 === 0) c.globalAlpha = 0.6;
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.ellipse(0, 24, 26, 7, 0, 0, TAU);
    c.fill();
    c.fillStyle = p.flash > 0 ? '#fff' : p.shipColor;
    c.strokeStyle = '#0b1030';
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(0, 6, 30, 11, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = p.shipAccent;
    for (const lx of [-16, 0, 16]) {
      c.beginPath();
      c.arc(lx, 9, 2.6, 0, TAU);
      c.fill();
    }
    c.fillStyle = 'rgba(189,239,255,0.92)';
    c.beginPath();
    c.ellipse(0, -3, 15, 13, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = p.charColor;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, -4, 9, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = '#121a45';
    c.fillRect(-6, -7, 12, 6);
    c.fillStyle = '#fff';
    c.fillRect(-4, -6, 2.5, 3);
    c.fillRect(1.5, -6, 2.5, 3);
    c.globalAlpha = 1;
    // barre de vie et nom
    const w = 52;
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.fillRect(-w / 2, -40, w, 8);
    c.fillStyle = p.isPlayer ? '#4ade80' : '#ff6b6b';
    c.fillRect(-w / 2 + 1, -39, (w - 2) * clamp(p.hp / p.maxHp, 0, 1), 6);
    c.font = '700 12px sans-serif';
    c.textAlign = 'center';
    c.lineWidth = 3;
    c.strokeStyle = '#0b1030';
    c.strokeText(p.name, 0, -46);
    c.fillStyle = p.isPlayer ? '#7df9ff' : '#fff';
    c.fillText(p.name, 0, -46);
    c.restore();
  }
}
