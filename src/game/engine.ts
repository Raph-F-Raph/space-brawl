import type { AttackKind, Character, Ship } from '../types';
import { getChapter, type ChapterTheme, type EnemyKind, type LevelDef, type WaveEntry } from './levels';
import { vibrate } from '../lib/settings';
import { sfx } from '../lib/audio';
import { levelMult } from './progress';

// Taille du terrain (le jeu s'adapte ensuite à l'écran, avec des bandes noires si besoin)
export const W = 960;
export const H = 540;
const TAU = Math.PI * 2;
const PLAYER_R = 18;

export interface PlayerStats {
  maxHp: number;
  damage: number; // dégâts de base d'un tir
  reduction: number; // dégâts retirés à chaque coup reçu
  speed: number; // pixels par seconde
  attackKind: AttackKind;
  charColor: string;
  charAccent: string;
  shipColor: string;
  shipAccent: string;
}

/** Les stats du personnage ET de la soucoupe s'additionnent. */
export function makeStats(c: Character, s: Ship, charLevel = 1, shipLevel = 1): PlayerStats {
  // Chaque niveau ajoute 8 % aux statistiques de base du personnage et de la soucoupe
  const mc = levelMult(charLevel);
  const ms = levelMult(shipLevel);
  return {
    maxHp: Math.round(c.hp * mc + s.hp * ms),
    damage: 6 + c.strength * mc + s.strength * 0.5 * ms,
    reduction: (c.resistance * mc + s.resistance * ms) * 0.5,
    speed: 150 + s.speed * 16,
    attackKind: c.attack_kind,
    charColor: c.color,
    charAccent: c.accent,
    shipColor: s.color,
    shipAccent: s.accent,
  };
}

export interface Hud {
  hp: number;
  maxHp: number;
  progress: number; // 0 à 100 : avancée vers le portail
  portalOpen: boolean;
  coins: number;
  boss: { hp: number; max: number } | null;
}

export interface EngineCallbacks {
  onHud: (h: Hud) => void;
  onEnd: (r: { won: boolean; coins: number }) => void;
}

// Caractéristiques des monstres
const ENEMY: Record<
  EnemyKind,
  { hp: number; speed: number; r: number; dmg: number; coins: number; color: string }
> = {
  grunt: { hp: 40, speed: 70, r: 16, dmg: 14, coins: 1, color: '#5bd75b' },
  fast: { hp: 24, speed: 125, r: 12, dmg: 10, coins: 2, color: '#ff9f1c' },
  tank: { hp: 130, speed: 45, r: 24, dmg: 22, coins: 4, color: '#9b5de5' },
  minion: { hp: 30, speed: 90, r: 12, dmg: 10, coins: 1, color: '#ff6b9d' },
  boss: { hp: 1400, speed: 38, r: 52, dmg: 28, coins: 20, color: '#e63946' },
};

interface Enemy {
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  r: number;
  speed: number;
  dmg: number;
  flash: number;
  // comportement du boss
  shootT: number;
  chargeT: number;
  summonT: number;
  charging: number;
  cvx: number;
  cvy: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dmg: number;
  life: number;
  friendly: boolean;
  pierce: boolean;
  hit: Set<Enemy>;
}

interface Asteroid {
  x: number;
  y: number;
  r: number;
  rot: number;
  spin: number;
  shape: number[]; // rayon de chaque sommet (forme irrégulière)
}

interface Ring {
  x: number;
  y: number;
  max: number;
  life: number;
  maxLife: number;
}

interface Pop {
  x: number;
  y: number;
  text: string;
  life: number;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export class Engine {
  // --- entrées (remplies par l'écran de jeu) ---
  paused = false;
  joy = { x: 0, y: 0 };
  keys = new Set<string>();
  fireBtn = false;
  aim: { x: number; y: number } | null = null; // visée manuelle (glisser sur le bouton de tir), sinon visée auto

  private ctx: CanvasRenderingContext2D;
  private cw = W;
  private ch = H;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private ended = false;

  private player = { x: W / 2, y: H / 2, hp: 0, invuln: 0, facing: 0 };
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private rings: Ring[] = [];
  private pops: Pop[] = [];
  private stars: { x: number; y: number; r: number; p: number }[] = [];

  private queue: EnemyKind[] = [];
  private spawnT = 0;
  private coins = 0;
  private theme: ChapterTheme;
  private fireCd = 0;

  // --- parcours : le terrain est plus large que l'écran, on avance vers un portail ---
  // On avance vers le HAUT de l'écran (« vers l'avant ») : le terrain est plus haut que l'écran.
  private worldH = H * 5;
  private camY = 0;
  private portalY = 90;
  private portalOpen = false;
  private arenaLocked = false; // le boss est là : on ne peut plus reculer
  private encounters: { y: number; kinds: EnemyKind[] }[] = [];
  private nextEnc = 0;
  private asteroids: Asteroid[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private level: LevelDef,
    private stats: PlayerStats,
    private cb: EngineCallbacks
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non supporté');
    this.ctx = ctx;
    this.theme = getChapter(level.chapter).theme;
    this.player.hp = stats.maxHp;
    this.player.x = W / 2;
    this.player.y = this.worldH - 90;
    this.encounters = this.buildEncounters();
    this.makeAsteroids();
    for (let i = 0; i < 200; i++) {
      this.stars.push({ x: Math.random() * W, y: Math.random() * this.worldH, r: 0.6 + Math.random() * 1.6, p: Math.random() * TAU });
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

  // ------------------------------------------------------------------
  // Boucle principale
  // ------------------------------------------------------------------
  private loop = (t: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    if (!this.paused && !this.ended) this.update(dt);
    this.render();
    this.cb.onHud(this.hud());
    if (this.ended) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private hud(): Hud {
    const boss = this.enemies.find((e) => e.kind === 'boss');
    return {
      hp: Math.max(0, Math.ceil(this.player.hp)),
      maxHp: this.stats.maxHp,
      progress: Math.round(clamp((this.worldH - 90 - this.player.y) / (this.worldH - 90 - this.portalY), 0, 1) * 100),
      portalOpen: this.portalOpen,
      coins: this.coins,
      boss: boss ? { hp: Math.max(0, boss.hp), max: boss.maxHp } : null,
    };
  }

  // ------------------------------------------------------------------
  // Vagues et apparition des monstres
  // ------------------------------------------------------------------
  // Les anciennes « vagues » deviennent des rencontres réparties le long du chemin :
  // elles se déclenchent quand on arrive à leur position. Le boss attend dans l'arène, au bout.
  private buildEncounters(): { y: number; kinds: EnemyKind[] }[] {
    const L = this.worldH;
    const shuffle = <T,>(arr: T[]) => {
      for (let a = arr.length - 1; a > 0; a--) {
        const b = Math.floor(Math.random() * (a + 1));
        [arr[a], arr[b]] = [arr[b], arr[a]];
      }
      return arr;
    };
    const expand = (w: WaveEntry[]) => {
      const out: EnemyKind[] = [];
      for (const g of w) for (let k = 0; k < g.count; k++) out.push(g.kind);
      return shuffle(out);
    };
    const waves = this.level.waves;
    const enc: { y: number; kinds: EnemyKind[] }[] = [];
    if (this.level.isBoss) {
      const pool = shuffle([...waves.slice(0, -1).flatMap(expand), ...waves.slice(0, -1).flatMap(expand)]);
      const parts = 3;
      const per = Math.ceil(pool.length / parts);
      for (let i = 0; i < parts; i++) enc.push({ y: L - (i / parts) * (L - H * 1.4), kinds: pool.slice(i * per, (i + 1) * per) });
      enc.push({ y: H * 0.62, kinds: expand(waves[waves.length - 1]) }); // le boss, dans l'arène tout en haut
    } else {
      const n = waves.length;
      waves.forEach((w, i) => enc.push({ y: L - (i / n) * (L - H * 1.3), kinds: expand(w) }));
    }
    return enc.filter((e) => e.kinds.length > 0);
  }

  // Quelques astéroïdes sur le chemin (pas beaucoup) : ils bloquent le passage et arrêtent les tirs.
  private makeAsteroids() {
    const count = this.level.isBoss ? 6 : 8;
    const top = this.level.isBoss ? H + 120 : 280; // pas d'astéroïde dans l'arène du boss ni devant le portail
    const bottom = this.worldH - 300; // ni au départ
    let guard = 0;
    while (this.asteroids.length < count && guard++ < 400) {
      const r = 24 + Math.random() * 20;
      const x = r + 30 + Math.random() * (W - 2 * r - 60);
      const y = top + Math.random() * (bottom - top);
      if (this.asteroids.some((a) => Math.hypot(a.x - x, a.y - y) < a.r + r + 150)) continue; // jamais de mur : on peut toujours passer
      this.asteroids.push({
        x,
        y,
        r,
        rot: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 0.5,
        shape: Array.from({ length: 9 }, () => 0.82 + Math.random() * 0.3),
      });
    }
  }

  /** Repousse un cercle (joueur, monstre) hors des astéroïdes. */
  private pushOutOfAsteroids(o: { x: number; y: number }, radius: number) {
    for (const a of this.asteroids) {
      const dx = o.x - a.x;
      const dy = o.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const min = a.r * 0.95 + radius;
      if (d < min) {
        o.x = a.x + (dx / d) * min;
        o.y = a.y + (dy / d) * min;
      }
    }
  }

  private spawn(kind: EnemyKind, at?: { x: number; y: number }) {
    const d = ENEMY[kind];
    let x: number;
    let y: number;
    if (at) {
      x = at.x;
      y = at.y;
    } else if (kind === 'boss') {
      x = W / 2;
      y = d.r + 20;
    } else {
      // les monstres arrivent surtout de devant (le haut), parfois des côtés, rarement de derrière
      const cy = this.camY;
      let side = Math.random() < 0.55 ? 2 : Math.floor(Math.random() * 4);
      if (side === 2 && cy <= 1) side = Math.random() < 0.5 ? 0 : 1; // tout en haut : plus rien ne vient d'en haut
      if (side === 3 && cy >= this.worldH - H - 1 && Math.random() < 0.5) side = 0;
      if (side === 0) [x, y] = [-20, cy + Math.random() * H];
      else if (side === 1) [x, y] = [W + 20, cy + Math.random() * H];
      else if (side === 2) [x, y] = [Math.random() * W, cy - 20];
      else [x, y] = [Math.random() * W, cy + H + 20];
    }
    this.enemies.push({
      kind,
      x,
      y,
      hp: Math.round(d.hp * this.theme.hpMult),
      maxHp: Math.round(d.hp * this.theme.hpMult),
      r: d.r,
      speed: d.speed,
      dmg: Math.round(d.dmg * this.theme.dmgMult),
      flash: 0,
      shootT: 2,
      chargeT: 5,
      summonT: 8,
      charging: 0,
      cvx: 0,
      cvy: 0,
    });
  }

  // ------------------------------------------------------------------
  // Mise à jour
  // ------------------------------------------------------------------
  private update(dt: number) {
    this.time += dt;
    const p = this.player;
    p.invuln = Math.max(0, p.invuln - dt);

    this.movePlayer(dt);
    this.pushOutOfAsteroids(p, PLAYER_R);
    this.camY = this.arenaLocked ? 0 : clamp(p.y - H * 0.62, 0, this.worldH - H); // le joueur reste dans le bas de l'écran : on voit devant
    for (const a of this.asteroids) a.rot += a.spin * dt;
    this.tryFire(dt);
    this.updateSpawning(dt);
    this.updateEnemies(dt);
    this.updateBullets(dt);

    for (const r of this.rings) r.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const o of this.pops) {
      o.life -= dt;
      o.y -= 30 * dt;
    }
    this.pops = this.pops.filter((o) => o.life > 0);

    this.collectDead();

    if (p.hp <= 0) this.finish(false);
  }

  private movePlayer(dt: number) {
    const p = this.player;
    let mx = this.joy.x;
    let my = this.joy.y;
    const jm = Math.hypot(mx, my);
    if (jm < 0.12) {
      mx = 0;
      my = 0;
      const k = this.keys;
      if (k.has('arrowleft') || k.has('q') || k.has('a')) mx -= 1;
      if (k.has('arrowright') || k.has('d')) mx += 1;
      if (k.has('arrowup') || k.has('z') || k.has('w')) my -= 1;
      if (k.has('arrowdown') || k.has('s')) my += 1;
      const m = Math.hypot(mx, my);
      if (m > 0) {
        mx /= m;
        my /= m;
      }
    } else if (jm > 1) {
      mx /= jm;
      my /= jm;
    }
    const minY = this.portalOpen ? PLAYER_R : this.portalY + 70; // portail fermé = on ne passe pas
    const maxY = this.arenaLocked ? H - PLAYER_R : this.worldH - PLAYER_R; // arène du boss : on ne recule plus
    p.x = clamp(p.x + mx * this.stats.speed * dt, PLAYER_R, W - PLAYER_R);
    p.y = clamp(p.y + my * this.stats.speed * dt, minY, maxY);
    if ((mx !== 0 || my !== 0) && !this.nearest(620) && !this.aim) p.facing = Math.atan2(my, mx);
  }

  private nearest(range: number): Enemy | null {
    let best: Enemy | null = null;
    let bd = range;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.x - this.player.x, e.y - this.player.y) - e.r;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  private shoot(angle: number, speed: number, dmg: number, r: number, pierce: boolean) {
    const p = this.player;
    this.bullets.push({
      x: p.x + Math.cos(angle) * 24,
      y: p.y + Math.sin(angle) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      dmg,
      life: 1.4,
      friendly: true,
      pierce,
      hit: new Set(),
    });
  }

  private tryFire(dt: number) {
    this.fireCd = Math.max(0, this.fireCd - dt);
    const p = this.player;
    const target = this.nearest(620);
    if (this.aim) p.facing = Math.atan2(this.aim.y, this.aim.x); // visée manuelle
    else if (target) p.facing = Math.atan2(target.y - p.y, target.x - p.x);
    const firing = this.fireBtn || this.keys.has(' ');
    if (!firing || this.fireCd > 0) return;

    const s = this.stats;
    switch (s.attackKind) {
      case 'laser':
        this.shoot(p.facing, 520, s.damage, 7, false);
        sfx('laser');
        this.fireCd = 0.32;
        break;
      case 'burst':
        for (const off of [-0.14, 0, 0.14]) this.shoot(p.facing + off, 560, s.damage * 0.62, 6, false);
        sfx('burst');
        this.fireCd = 0.5;
        break;
      case 'spread':
        for (const off of [-0.32, -0.16, 0, 0.16, 0.32]) this.shoot(p.facing + off, 500, s.damage * 0.5, 5, false);
        sfx('burst');
        this.fireCd = 0.62;
        break;
      case 'pierce':
        this.shoot(p.facing, 640, s.damage * 0.9, 9, true);
        sfx('pierce');
        this.fireCd = 0.5;
        break;
      case 'shockwave': {
        const range = 125;
        this.rings.push({ x: p.x, y: p.y, max: range, life: 0.35, maxLife: 0.35 });
        sfx('shockwave');
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < range + e.r) {
            this.damageEnemy(e, s.damage * 1.3);
            if (e.kind !== 'boss' && d > 0) {
              e.x += ((e.x - p.x) / d) * 30;
              e.y += ((e.y - p.y) / d) * 30;
            }
          }
        }
        this.fireCd = 0.85;
        break;
      }
    }
  }

  private updateSpawning(dt: number) {
    const p = this.player;
    // une nouvelle rencontre se déclenche quand on arrive à sa position
    if (this.nextEnc < this.encounters.length && this.queue.length === 0 && p.y <= this.encounters[this.nextEnc].y) {
      const enc = this.encounters[this.nextEnc];
      this.nextEnc++;
      this.queue = [...enc.kinds];
      if (enc.kinds.includes('boss')) {
        this.arenaLocked = true;
        sfx('boss');
        this.queue.sort((a, b) => (a === 'boss' ? 1 : 0) - (b === 'boss' ? 1 : 0)); // le boss sort en premier
      }
      this.spawnT = 0.4;
    }
    if (this.queue.length > 0) {
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        const kind = this.queue.pop() as EnemyKind;
        this.spawn(kind);
        this.spawnT = kind === 'boss' ? 0.2 : 0.5;
      }
      return;
    }
    // tout est passé et nettoyé : le portail s'ouvre
    const cleared = this.nextEnc >= this.encounters.length && !this.enemies.some((e) => e.hp > 0);
    if (cleared && !this.portalOpen) {
      this.portalOpen = true;
      this.rings.push({ x: W / 2, y: this.portalY, max: 150, life: 0.8, maxLife: 0.8 });
      this.pops.push({ x: p.x, y: p.y - 44, text: 'Portail ouvert !', life: 1.8 });
      sfx('portal');
      vibrate(80);
    }
    if (this.portalOpen && Math.abs(p.x - W / 2) < 90 && Math.abs(p.y - this.portalY) < 46) this.finish(true); // le portail est large et plat
  }

  private hurtPlayer(base: number) {
    const p = this.player;
    if (p.invuln > 0) return;
    const dmg = Math.max(1, Math.round(base - this.stats.reduction));
    p.hp -= dmg;
    p.invuln = 0.7;
    sfx('hurt');
    vibrate(40);
  }

  private damageEnemy(e: Enemy, dmg: number) {
    e.hp -= dmg;
    e.flash = 0.08;
    sfx('hit');
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const nx = dx / d;
      const ny = dy / d;
      e.flash = Math.max(0, e.flash - dt);

      if (e.kind === 'boss') this.updateBoss(e, dt, nx, ny);
      else {
        e.x += nx * e.speed * dt;
        e.y += ny * e.speed * dt;
      }

      if (e.kind !== 'boss') this.pushOutOfAsteroids(e, e.r);
      if (d < e.r + PLAYER_R - 4) this.hurtPlayer(e.dmg);
    }

    // Les monstres se poussent entre eux pour ne pas se superposer
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const a = this.enemies[i];
        const b = this.enemies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const min = a.r + b.r;
        if (dist < min) {
          const push = (min - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          const wa = a.kind === 'boss' ? 0 : 1;
          const wb = b.kind === 'boss' ? 0 : 1;
          a.x -= ux * push * wa * 2;
          a.y -= uy * push * wa * 2;
          b.x += ux * push * wb * 2;
          b.y += uy * push * wb * 2;
        }
      }
    }
  }

  private updateBoss(e: Enemy, dt: number, nx: number, ny: number) {
    const phase2 = e.hp < e.maxHp * 0.5;
    if (e.charging > 0) {
      e.charging -= dt;
      e.x += e.cvx * dt;
      e.y += e.cvy * dt;
    } else {
      const sp = e.speed * (phase2 ? 1.4 : 1);
      e.x += nx * sp * dt;
      e.y += ny * sp * dt;
      e.chargeT -= dt;
      if (e.chargeT <= 0) {
        e.charging = 0.9;
        e.cvx = nx * 340;
        e.cvy = ny * 340;
        e.chargeT = phase2 ? 5 : 7;
      }
    }

    e.shootT -= dt;
    if (e.shootT <= 0 && e.charging <= 0) {
      const n = phase2 ? 18 : 12;
      const speed = phase2 ? 200 : 165;
      const off = this.time * 0.7;
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * TAU;
        this.bullets.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          r: 7,
          dmg: phase2 ? 18 : 15,
          life: 6,
          friendly: false,
          pierce: false,
          hit: new Set(),
        });
      }
      e.shootT = phase2 ? 1.6 : 2.4;
      sfx('bossShot');
    }

    e.summonT -= dt;
    if (e.summonT <= 0) {
      this.spawn('minion', { x: e.x - 40, y: e.y });
      this.spawn('minion', { x: e.x + 40, y: e.y });
      e.summonT = 9;
    }

    e.x = clamp(e.x, e.r, W - e.r);
    e.y = clamp(e.y, e.r, H - e.r);
  }

  private updateBullets(dt: number) {
    const p = this.player;
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.x < -40 || b.x > W + 40 || b.y < this.camY - 40 || b.y > this.camY + H + 40) b.life = 0;
      for (const a of this.asteroids) if (Math.hypot(b.x - a.x, b.y - a.y) < a.r * 0.9 + b.r) b.life = 0; // les astéroïdes arrêtent les tirs
      if (b.life <= 0) continue;

      if (b.friendly) {
        for (const e of this.enemies) {
          if (e.hp <= 0 || b.hit.has(e)) continue;
          if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
            this.damageEnemy(e, b.dmg);
            if (b.pierce) b.hit.add(e);
            else {
              b.life = 0;
              break;
            }
          }
        }
      } else if (Math.hypot(p.x - b.x, p.y - b.y) < PLAYER_R + b.r - 3) {
        this.hurtPlayer(b.dmg);
        b.life = 0;
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
  }

  private collectDead() {
    const alive: Enemy[] = [];
    for (const e of this.enemies) {
      if (e.hp > 0) {
        alive.push(e);
        continue;
      }
      const c = ENEMY[e.kind].coins;
      this.coins += c;
      sfx('kill');
      sfx('coin');
      this.pops.push({ x: e.x, y: e.y, text: `+${c}`, life: 0.8 });
    }
    this.enemies = alive;
  }

  private finish(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    sfx(won ? 'win' : 'lose');
    if (won) this.coins += this.level.bonus;
    this.cb.onEnd({ won, coins: this.coins });
  }

  // ------------------------------------------------------------------
  // Dessin
  // ------------------------------------------------------------------
  private render() {
    const c = this.ctx;
    const dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#04061a';
    c.fillRect(0, 0, this.cw, this.ch);

    const sc = Math.min(this.cw / W, this.ch / H);
    const ox = (this.cw - W * sc) / 2;
    const oy = (this.ch - H * sc) / 2;
    c.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);

    c.save();
    c.beginPath();
    c.rect(0, 0, W, H);
    c.clip();

    // Fond
    const g = c.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.65);
    g.addColorStop(0, this.theme.bg2);
    g.addColorStop(1, this.theme.bg1);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // tout ce qui suit est dessiné dans le terrain (décalé par la caméra)
    c.save();
    c.translate(0, -this.camY);

    c.strokeStyle = 'rgba(255,255,255,0.05)';
    c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= W; x += 60) {
      c.moveTo(x, this.camY);
      c.lineTo(x, this.camY + H);
    }
    for (let y = Math.floor(this.camY / 60) * 60; y <= this.camY + H; y += 60) {
      c.moveTo(0, y);
      c.lineTo(W, y);
    }
    c.stroke();

    for (const s of this.stars) {
      if (s.y < this.camY - 4 || s.y > this.camY + H + 4) continue;
      c.globalAlpha = 0.45 + 0.4 * Math.sin(this.time * 2 + s.p);
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;

    // Ondes de choc
    for (const r of this.rings) {
      const t = 1 - r.life / r.maxLife;
      c.strokeStyle = `rgba(255,159,28,${1 - t})`;
      c.lineWidth = 8 * (1 - t) + 2;
      c.beginPath();
      c.arc(r.x, r.y, r.max * t, 0, TAU);
      c.stroke();
    }

    this.drawPortal();
    this.drawAsteroids();
    for (const e of this.enemies) this.drawEnemy(e);

    for (const b of this.bullets) {
      c.fillStyle = b.friendly ? '#7df9ff' : '#ff4d6d';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(b.x, b.y, b.r, 0, TAU);
      c.fill();
      c.stroke();
    }

    this.drawPlayer();

    c.font = "bold 18px 'Lilita One', 'Arial Black', sans-serif";
    c.textAlign = 'center';
    for (const o of this.pops) {
      c.globalAlpha = Math.min(1, o.life * 2);
      c.lineWidth = 4;
      c.strokeStyle = '#0b1030';
      c.strokeText(o.text, o.x, o.y);
      c.fillStyle = '#ffd23f';
      c.fillText(o.text, o.x, o.y);
    }
    c.globalAlpha = 1;
    c.restore(); // fin du décalage caméra

    // Flèche « avance » quand il n'y a plus de monstres devant soi
    const idle = this.queue.length === 0 && !this.enemies.some((e) => e.hp > 0);
    if (idle && !this.arenaLocked && this.player.y > this.portalY + 220) {
      c.save();
      c.globalAlpha = 0.55 + 0.4 * Math.sin(this.time * 6);
      c.translate(W / 2, 70 - Math.sin(this.time * 6) * 6);
      c.beginPath(); // grosse flèche vers le haut
      c.moveTo(0, -26);
      c.lineTo(30, 6);
      c.lineTo(12, 6);
      c.lineTo(12, 28);
      c.lineTo(-12, 28);
      c.lineTo(-12, 6);
      c.lineTo(-30, 6);
      c.closePath();
      c.fillStyle = '#ffd23f';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 5;
      c.lineJoin = 'round';
      c.stroke();
      c.fill();
      c.restore();
    }

    c.restore();

    // Bordure du terrain
    c.strokeStyle = 'rgba(125,249,255,0.5)';
    c.lineWidth = 3;
    c.strokeRect(0, 0, W, H);
  }

  private drawPortal() {
    const c = this.ctx;
    const x = W / 2;
    const y = this.portalY;
    const t = this.time;
    const open = this.portalOpen;
    if (y < this.camY - 160 || y > this.camY + H + 160) return;
    c.save();
    c.translate(x, y);
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 160);
    g.addColorStop(0, open ? 'rgba(125,249,255,0.6)' : 'rgba(120,120,170,0.25)');
    g.addColorStop(1, 'rgba(125,249,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(0, 0, 200, 120, 0, 0, TAU);
    c.fill();
    c.globalAlpha = open ? 1 : 0.55;
    const cols = open ? ['#7df9ff', '#b57bff', '#ffffff'] : ['#6b6f9a', '#55597f', '#7a7ea8'];
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = cols[i];
      c.lineWidth = 8 - i * 2;
      c.beginPath();
      c.ellipse(0, 0, 100 - i * 11 + (open ? Math.sin(t * 4 + i) * 3 : 0), 40 + i * 6, 0, 0, TAU);
      c.stroke();
    }
    if (open) {
      c.strokeStyle = 'rgba(255,255,255,0.85)';
      c.lineWidth = 3;
      c.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const a = t * 3 + (k * TAU) / 3;
        c.beginPath();
        c.ellipse(0, 0, 70, 24, 0, a, a + 1.1);
        c.stroke();
      }
    } else {
      c.font = '36px sans-serif';
      c.textAlign = 'center';
      c.fillText('🔒', 0, 12);
    }
    c.restore();
  }

  private drawAsteroids() {
    const c = this.ctx;
    for (const a of this.asteroids) {
      if (a.y < this.camY - 80 || a.y > this.camY + H + 80) continue;
      c.save();
      c.translate(a.x, a.y);
      c.rotate(a.rot);
      c.beginPath();
      a.shape.forEach((k, i) => {
        const ang = (i / a.shape.length) * TAU;
        const px = Math.cos(ang) * a.r * k;
        const py = Math.sin(ang) * a.r * k;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      });
      c.closePath();
      c.fillStyle = '#7b7488';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 4;
      c.lineJoin = 'round';
      c.fill();
      c.stroke();
      // cratères
      c.fillStyle = 'rgba(0,0,0,0.22)';
      for (const [cx, cy, cr] of [[-0.3, -0.2, 0.28], [0.35, 0.25, 0.2], [0.05, 0.45, 0.14]]) {
        c.beginPath();
        c.arc(cx * a.r, cy * a.r, cr * a.r, 0, TAU);
        c.fill();
      }
      c.restore();
    }
  }

  private drawEnemy(e: Enemy) {
    const c = this.ctx;
    const p = this.player;
    const ang = Math.atan2(p.y - e.y, p.x - e.x);
    const lx = Math.cos(ang);
    const ly = Math.sin(ang);
    const r = e.r;

    c.save();
    c.translate(e.x, e.y);
    c.fillStyle = e.flash > 0 ? '#ffffff' : this.theme.enemy[e.kind];
    c.strokeStyle = '#0b1030';
    c.lineWidth = 4;
    c.lineJoin = 'round';

    if (e.kind === 'fast') {
      c.save();
      c.rotate(ang);
      c.beginPath();
      c.moveTo(r * 1.4, 0);
      c.lineTo(-r, -r * 1.0);
      c.lineTo(-r * 0.5, 0);
      c.lineTo(-r, r * 1.0);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    } else {
      if (e.kind === 'boss') {
        // cornes
        c.fillStyle = e.flash > 0 ? '#fff' : '#ffd23f';
        for (const sx of [-1, 1]) {
          c.beginPath();
          c.moveTo(sx * r * 0.45, -r * 0.85);
          c.lineTo(sx * r * 0.95, -r * 1.45);
          c.lineTo(sx * r * 0.85, -r * 0.55);
          c.closePath();
          c.fill();
          c.stroke();
        }
        c.fillStyle = e.flash > 0 ? '#ffffff' : this.theme.enemy.boss;
      }
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.fill();
      c.stroke();
      if (e.kind === 'tank') {
        c.strokeStyle = 'rgba(255,255,255,0.55)';
        c.lineWidth = 4;
        c.beginPath();
        c.arc(0, 0, r * 0.68, 0.3, Math.PI - 0.3);
        c.stroke();
      }
    }

    // Yeux qui suivent le joueur
    const eyeR = r * (e.kind === 'fast' ? 0.2 : 0.26);
    const ex = r * (e.kind === 'fast' ? 0.15 : 0.36);
    const ey = -r * 0.12;
    for (const sx of [-1, 1]) {
      c.fillStyle = '#fff';
      c.strokeStyle = '#0b1030';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(sx * ex, ey, eyeR, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = e.kind === 'boss' ? '#b00020' : '#0b1030';
      c.beginPath();
      c.arc(sx * ex + lx * eyeR * 0.45, ey + ly * eyeR * 0.45, eyeR * 0.5, 0, TAU);
      c.fill();
    }
    if (e.kind === 'boss') {
      // sourcils en colère
      c.strokeStyle = '#0b1030';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-r * 0.7, -r * 0.55);
      c.lineTo(-r * 0.15, -r * 0.3);
      c.moveTo(r * 0.7, -r * 0.55);
      c.lineTo(r * 0.15, -r * 0.3);
      c.stroke();
    }
    c.restore();

    // Petite barre de vie (sauf boss : barre en haut de l'écran)
    if (e.kind !== 'boss' && e.hp < e.maxHp) {
      const w = r * 2;
      c.fillStyle = 'rgba(0,0,0,0.6)';
      c.fillRect(e.x - w / 2, e.y - r - 10, w, 5);
      c.fillStyle = '#5bd75b';
      c.fillRect(e.x - w / 2, e.y - r - 10, (w * Math.max(0, e.hp)) / e.maxHp, 5);
    }
  }

  private drawPlayer() {
    const c = this.ctx;
    const p = this.player;
    const s = this.stats;

    // Ligne de visée
    const hasTarget = this.nearest(620) !== null || this.aim !== null;
    if (hasTarget) {
      c.save();
      c.strokeStyle = 'rgba(125,249,255,0.35)';
      c.lineWidth = 2;
      c.setLineDash([6, 8]);
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + Math.cos(p.facing) * 90, p.y + Math.sin(p.facing) * 90);
      c.stroke();
      c.restore();
    }

    c.save();
    c.translate(p.x, p.y);
    if (p.invuln > 0 && Math.floor(this.time * 20) % 2 === 0) c.globalAlpha = 0.45;
    c.lineJoin = 'round';

    // Ombre
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.ellipse(0, 24, 26, 7, 0, 0, TAU);
    c.fill();

    // Disque
    c.fillStyle = s.shipColor;
    c.strokeStyle = '#0b1030';
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(0, 6, 30, 11, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = s.shipAccent;
    for (const lx of [-16, 0, 16]) {
      c.beginPath();
      c.arc(lx, 9, 2.6, 0, TAU);
      c.fill();
    }

    // Dôme
    c.fillStyle = 'rgba(189,239,255,0.92)';
    c.beginPath();
    c.ellipse(0, -3, 15, 13, 0, 0, TAU);
    c.fill();
    c.stroke();

    // Tête du pilote
    c.fillStyle = s.charColor;
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

    c.restore();
  }
}
