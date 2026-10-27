export type EnemyKind = 'grunt' | 'fast' | 'tank' | 'minion' | 'boss';

export interface WaveEntry {
  kind: EnemyKind;
  count: number;
}

export interface LevelDef {
  chapter: number;
  level: number;
  name: string;
  waves: WaveEntry[][]; // une vague = une liste de groupes d'ennemis
  isBoss: boolean;
  bonus: number; // pièces bonus à la victoire
}

export interface ChapterTheme {
  bg1: string; // fond du terrain : bord
  bg2: string; // fond du terrain : centre
  enemy: Record<EnemyKind, string>; // couleur de chaque monstre
  bossName: string;
  hpMult: number; // les monstres ont plus de vie dans les chapitres avancés
  dmgMult: number; // et font plus de dégâts
}

export interface ChapterDef {
  id: number;
  name: string;
  theme: ChapterTheme;
  levels: LevelDef[];
}

// Pour ajouter des niveaux ou un chapitre : copie un bloc ci-dessous et change les nombres.
export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    name: "La ceinture d'astéroïdes",
    theme: {
      bg1: '#0a0f33',
      bg2: '#1b2a6b',
      enemy: { grunt: '#5bd75b', fast: '#ff9f1c', tank: '#9b5de5', minion: '#ff6b9d', boss: '#e63946' },
      bossName: 'Gorgonax',
      hpMult: 1,
      dmgMult: 1,
    },
    levels: [
      {
        chapter: 1,
        level: 1,
        name: 'Premier contact',
        isBoss: false,
        bonus: 10,
        waves: [
          [{ kind: 'grunt', count: 5 }],
          [
            { kind: 'grunt', count: 6 },
            { kind: 'fast', count: 2 },
          ],
          [
            { kind: 'grunt', count: 8 },
            { kind: 'fast', count: 4 },
          ],
        ],
      },
      {
        chapter: 1,
        level: 2,
        name: 'Champ de débris',
        isBoss: false,
        bonus: 15,
        waves: [
          [{ kind: 'grunt', count: 8 }],
          [
            { kind: 'fast', count: 6 },
            { kind: 'grunt', count: 6 },
          ],
          [
            { kind: 'tank', count: 1 },
            { kind: 'grunt', count: 8 },
          ],
          [
            { kind: 'tank', count: 2 },
            { kind: 'fast', count: 6 },
          ],
        ],
      },
      {
        chapter: 1,
        level: 3,
        name: 'Pluie de météores',
        isBoss: false,
        bonus: 20,
        waves: [
          [{ kind: 'fast', count: 10 }],
          [
            { kind: 'tank', count: 2 },
            { kind: 'grunt', count: 10 },
          ],
          [
            { kind: 'tank', count: 3 },
            { kind: 'fast', count: 8 },
          ],
          [
            { kind: 'grunt', count: 14 },
            { kind: 'fast', count: 8 },
          ],
        ],
      },
      {
        chapter: 1,
        level: 4,
        name: 'Base ennemie',
        isBoss: false,
        bonus: 25,
        waves: [
          [
            { kind: 'tank', count: 2 },
            { kind: 'grunt', count: 12 },
          ],
          [
            { kind: 'fast', count: 12 },
            { kind: 'tank', count: 2 },
          ],
          [
            { kind: 'tank', count: 4 },
            { kind: 'grunt', count: 10 },
          ],
          [
            { kind: 'tank', count: 3 },
            { kind: 'fast', count: 12 },
            { kind: 'grunt', count: 10 },
          ],
        ],
      },
      {
        chapter: 1,
        level: 5,
        name: 'MÉGA BOSS : Gorgonax',
        isBoss: true,
        bonus: 50,
        waves: [[{ kind: 'minion', count: 6 }], [{ kind: 'boss', count: 1 }]],
      },
    ],
  },
];


// ---------------------------------------------------------------------------
// Chapitres 2 à 6 : même structure que le chapitre 1 (4 niveaux + un méga boss),
// avec plus de monstres, plus de vie, plus de dégâts, et un nouveau décor / boss.
// Pour modifier un chapitre : change son nom, ses couleurs, son boss ou les noms de niveaux ci-dessous.
// ---------------------------------------------------------------------------
interface ChapterSeed {
  name: string;
  bossName: string;
  levelNames: [string, string, string, string];
  bg1: string;
  bg2: string;
  enemy: ChapterTheme['enemy'];
}

const SEEDS: ChapterSeed[] = [
  {
    name: 'La nébuleuse violette',
    bossName: 'Spectrax',
    levelNames: ['Brume mystérieuse', 'Tempête ionique', 'Cimetière de vaisseaux', 'Portail sombre'],
    bg1: '#150a33',
    bg2: '#4b2a8f',
    enemy: { grunt: '#c77dff', fast: '#ff70a6', tank: '#5e60ce', minion: '#ffd6ff', boss: '#9d4edd' },
  },
  {
    name: 'La planète de glace',
    bossName: 'Cryolith',
    levelNames: ['Plaine gelée', 'Blizzard cosmique', 'Grottes de cristal', 'Forteresse de glace'],
    bg1: '#06243a',
    bg2: '#2a7fa8',
    enemy: { grunt: '#8ecae6', fast: '#ffffff', tank: '#219ebc', minion: '#caf0f8', boss: '#48cae4' },
  },
  {
    name: 'La planète de lave',
    bossName: 'Magmor',
    levelNames: ['Rivières de feu', 'Pluie de cendres', 'Volcan en colère', 'Cœur du magma'],
    bg1: '#2e0a05',
    bg2: '#a3350f',
    enemy: { grunt: '#ff7b00', fast: '#ffd60a', tank: '#9d0208', minion: '#ffba08', boss: '#d00000' },
  },
  {
    name: 'La jungle extraterrestre',
    bossName: 'Toxica',
    levelNames: ['Spores volantes', 'Marais toxique', 'Ruches géantes', 'Temple végétal'],
    bg1: '#06260f',
    bg2: '#1f7a3d',
    enemy: { grunt: '#b7e4c7', fast: '#ffee32', tank: '#6a994e', minion: '#d8f3dc', boss: '#7ae582' },
  },
  {
    name: 'Le trou noir',
    bossName: 'Néantor',
    levelNames: ['Horizon des événements', 'Étoiles mourantes', 'Spirale infernale', 'Au bord du vide'],
    bg1: '#030308',
    bg2: '#2b1b3d',
    enemy: { grunt: '#adb5bd', fast: '#f72585', tank: '#4361ee', minion: '#e5e5e5', boss: '#ffffff' },
  },
];

function scaleWaves(waves: WaveEntry[][], factor: number): WaveEntry[][] {
  return waves.map((w) => w.map((e) => ({ kind: e.kind, count: Math.max(1, Math.round(e.count * factor)) })));
}

function buildChapter(id: number, seed: ChapterSeed): ChapterDef {
  const base = CHAPTERS[0].levels; // on réutilise la forme des vagues du chapitre 1
  const factor = 1 + 0.18 * (id - 1);
  const levels: LevelDef[] = base.map((b, i) => {
    if (b.isBoss) {
      return {
        chapter: id,
        level: b.level,
        name: `MÉGA BOSS : ${seed.bossName}`,
        isBoss: true,
        bonus: Math.round(b.bonus * (1 + 0.25 * (id - 1))),
        waves: [[{ kind: 'minion', count: 6 + 2 * (id - 1) }], [{ kind: 'boss', count: 1 }]],
      };
    }
    return {
      chapter: id,
      level: b.level,
      name: seed.levelNames[i],
      isBoss: false,
      bonus: Math.round(b.bonus * (1 + 0.25 * (id - 1))),
      waves: scaleWaves(b.waves, factor),
    };
  });
  return {
    id,
    name: seed.name,
    theme: {
      bg1: seed.bg1,
      bg2: seed.bg2,
      enemy: { ...seed.enemy },
      bossName: seed.bossName,
      hpMult: 1 + 0.4 * (id - 1),
      dmgMult: 1 + 0.15 * (id - 1),
    },
    levels,
  };
}

SEEDS.forEach((seed, i) => CHAPTERS.push(buildChapter(i + 2, seed)));

export function getChapter(chapter: number): ChapterDef {
  return CHAPTERS.find((x) => x.id === chapter) ?? CHAPTERS[0];
}

export function getLevel(chapter: number, level: number): LevelDef {
  const c = CHAPTERS.find((x) => x.id === chapter) ?? CHAPTERS[0];
  return c.levels.find((l) => l.level === level) ?? c.levels[0];
}
