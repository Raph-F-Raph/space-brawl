export type EnemyKind = 'grunt' | 'fast' | 'tank' | 'minion' | 'shooter' | 'bomber' | 'boss';

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
      enemy: { grunt: '#5bd75b', fast: '#ff9f1c', tank: '#9b5de5', minion: '#ff6b9d', shooter: '#ffd166', bomber: '#ef476f', boss: '#e63946' },
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
  enemy: Omit<ChapterTheme['enemy'], 'shooter' | 'bomber'>;
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
  {
    name: 'La cité des robots',
    bossName: 'Mécanox',
    levelNames: ['Usine en ruine', 'Chaîne de montage', 'Réacteur surchauffé', 'Tour de contrôle'],
    bg1: '#021a1f',
    bg2: '#0b6e7a',
    enemy: { grunt: '#9ad1d4', fast: '#00f5d4', tank: '#577590', minion: '#caf0f8', boss: '#00bbf9' },
  },
  {
    name: 'Le cœur de la galaxie',
    bossName: 'Galaxor',
    levelNames: ['Étoiles jumelles', 'Pluie de comètes', 'Tempête stellaire', 'Le trône cosmique'],
    bg1: '#1a0533',
    bg2: '#b5179e',
    enemy: { grunt: '#ffd166', fast: '#ff4d6d', tank: '#7209b7', minion: '#ffe5ec', boss: '#ffd700' },
  },
  {
    name: 'Le désert de cristal',
    bossName: 'Cristalor',
    levelNames: ['Dunes étincelantes', 'Tempête de sable', 'Canyon des échos', 'Palais de cristal'],
    bg1: '#2a1a05',
    bg2: '#c98a2b',
    enemy: { grunt: '#f4d35e', fast: '#ee964b', tank: '#8d5a2b', minion: '#fff1c1', boss: '#f95738' },
  },
  {
    name: "L'océan d'étoiles",
    bossName: 'Abyssor',
    levelNames: ['Vagues cosmiques', 'Récif lumineux', 'Courants noirs', 'Fosse des géants'],
    bg1: '#02101f',
    bg2: '#0a5c8a',
    enemy: { grunt: '#48cae4', fast: '#90e0ef', tank: '#023e8a', minion: '#caf0f8', boss: '#00b4d8' },
  },
  {
    name: 'La forêt fantôme',
    bossName: 'Hantaxe',
    levelNames: ['Sentier brumeux', 'Arbres murmurants', 'Clairière hantée', 'Racine ancestrale'],
    bg1: '#0b1a14',
    bg2: '#3a7d6e',
    enemy: { grunt: '#b8f2e6', fast: '#e0fbfc', tank: '#5e8c61', minion: '#d8f3dc', boss: '#80ed99' },
  },
  {
    name: "L'orage cosmique",
    bossName: 'Foudrax',
    levelNames: ['Nuages électriques', 'Éclairs en chaîne', 'Œil du cyclone', 'Colonne de foudre'],
    bg1: '#10122e',
    bg2: '#4a4fd1',
    enemy: { grunt: '#a2d2ff', fast: '#ffe66d', tank: '#3a0ca3', minion: '#e0e1ff', boss: '#ffe66d' },
  },
  {
    name: 'Le vaisseau-mère',
    bossName: 'Armadax',
    levelNames: ['Hangar ennemi', 'Couloirs blindés', 'Salle des canons', 'Pont de commandement'],
    bg1: '#14141c',
    bg2: '#6b6f80',
    enemy: { grunt: '#ced4da', fast: '#ff6b6b', tank: '#495057', minion: '#dee2e6', boss: '#adb5bd' },
  },
  {
    name: 'La dimension miroir',
    bossName: 'Reflétor',
    levelNames: ['Salle des reflets', 'Doubles maléfiques', 'Labyrinthe de verre', 'Le grand miroir'],
    bg1: '#1b1030',
    bg2: '#a98bd8',
    enemy: { grunt: '#e0c3fc', fast: '#ffffff', tank: '#7b6fd1', minion: '#f1e4ff', boss: '#d9c2ff' },
  },
  {
    name: "La fin de l'univers",
    bossName: 'Omégax',
    levelNames: ['Étoiles éteintes', 'Dernière lumière', 'Le grand silence', 'Le trône du néant'],
    bg1: '#000000',
    bg2: '#7a0e3a',
    enemy: { grunt: '#ff758f', fast: '#ffb3c1', tank: '#590d22', minion: '#ffccd5', boss: '#ff4d6d' },
  },
];

// ---------------------------------------------------------------------------
// Chapitres 16 à 50 : thèmes et boss générés ; couleurs calculées à partir d'une teinte.
// ---------------------------------------------------------------------------
const FAR: [string, string][] = [
  ['Les ruines stellaires', 'Archonte'], ['Le jardin lunaire', 'Sélénor'], ['La mer de plasma', 'Plasmor'],
  ['Les montagnes flottantes', 'Aéroliss'], ['La station abandonnée', 'Vorax-9'], ['La nébuleuse écarlate', 'Pourprax'],
  ['Le marais d\'étoiles', 'Bourbos'], ['Le canyon gravitationnel', 'Gravitor'], ['La cité de cristal noir', 'Obsidor'],
  ['Le désert d\'antimatière', 'Antimax'], ['La forêt de néons', 'Néonox'], ['Le labyrinthe temporel', 'Chronox'],
  ['Les glaciers sombres', 'Glaciax'], ['La fournaise éternelle', 'Pyrox'], ['Le sanctuaire des anciens', 'Ancestrax'],
  ['La tempête magnétique', 'Magnétor'], ['Le cimetière des géants', 'Titanox'], ['L\'archipel des comètes', 'Cométor'],
  ['La dimension inversée', 'Inversor'], ['La forge cosmique', 'Forgax'], ['Les jardins suspendus', 'Floralix'],
  ['La citadelle fantôme', 'Spectrion'], ['Le puits sans fond', 'Abyssal'], ['Le royaume des miroirs brisés', 'Fractalor'],
  ['La galaxie rebelle', 'Rebelor'], ['L\'horloge du cosmos', 'Horlogax'], ['Le volcan stellaire', 'Éruptor'],
  ['La bibliothèque infinie', 'Savantor'], ['Le colisée des étoiles', 'Colossax'], ['L\'ombre du créateur', 'Ombrax'],
  ['Le dragon des galaxies', 'Draconox'], ['La porte de l\'infini', 'Infinitor'], ['Le conseil des boss', 'Tribunax'],
  ['Le dernier rempart', 'Rempartor'], ['Le trône de l\'univers', 'Cosmocrator'],
];
const FAR_LEVELS: [string, string, string, string][] = [
  ['Premiers pas', 'Terrain piégé', 'Cœur du danger', 'Dernier rempart'],
  ['Zone d\'approche', 'Embuscade', 'Tempête de tirs', 'La porte du boss'],
  ['Territoire hostile', 'Pluie de monstres', 'Siège final', 'L\'antre du boss'],
];
FAR.forEach(([name, bossName], i) => {
  const id = 16 + i;
  const h = (id * 47) % 360;
  SEEDS.push({
    name,
    bossName,
    levelNames: FAR_LEVELS[i % 3],
    bg1: `hsl(${h}, 60%, 7%)`,
    bg2: `hsl(${h}, 55%, 34%)`,
    enemy: {
      grunt: `hsl(${(h + 40) % 360}, 70%, 72%)`,
      fast: `hsl(${(h + 120) % 360}, 90%, 65%)`,
      tank: `hsl(${(h + 200) % 360}, 55%, 45%)`,
      minion: `hsl(${(h + 20) % 360}, 80%, 88%)`,
      boss: `hsl(${(h + 160) % 360}, 90%, 62%)`,
    },
  });
});

function scaleWaves(waves: WaveEntry[][], factor: number): WaveEntry[][] {
  return waves.map((w) => w.map((e) => ({ kind: e.kind, count: Math.max(1, Math.round(e.count * factor)) })));
}

// À partir du chapitre 2, des tireurs (qui visent de loin) arrivent ; à partir du chapitre 3, des bombes vivantes aussi.
function addNewMonsters(waves: WaveEntry[][], chapter: number, levelIndex: number): WaveEntry[][] {
  if (chapter < 2 || levelIndex < 1) return waves;
  const out = waves.map((w) => w.map((e) => ({ ...e })));
  out[out.length - 1].push({ kind: 'shooter', count: Math.min(2 + chapter, 7) });
  if (chapter >= 3 && out.length > 1) out[1].push({ kind: 'bomber', count: Math.min(chapter, 5) });
  return out;
}

function buildChapter(id: number, seed: ChapterSeed): ChapterDef {
  const base = CHAPTERS[0].levels; // on réutilise la forme des vagues du chapitre 1
  const factor = id <= 8 ? 1 + 0.18 * (id - 1) : id <= 15 ? 2.26 + 0.1 * (id - 8) : Math.min(2.96 + 0.03 * (id - 15), 4); // ensuite la croissance ralentit
  const levels: LevelDef[] = base.map((b, i) => {
    if (b.isBoss) {
      return {
        chapter: id,
        level: b.level,
        name: `MÉGA BOSS : ${seed.bossName}`,
        isBoss: true,
        bonus: Math.min(Math.round(b.bonus * (1 + 0.25 * (id - 1))), 220),
        waves: [[{ kind: 'minion', count: Math.min(6 + 2 * (id - 1), 20) }], [{ kind: 'boss', count: 1 }]],
      };
    }
    return {
      chapter: id,
      level: b.level,
      name: seed.levelNames[i],
      isBoss: false,
      bonus: Math.min(Math.round(b.bonus * (1 + 0.25 * (id - 1))), 220),
      waves: addNewMonsters(scaleWaves(b.waves, factor), id, i),
    };
  });
  return {
    id,
    name: seed.name,
    theme: {
      bg1: seed.bg1,
      bg2: seed.bg2,
      enemy: { shooter: '#ffd166', bomber: '#ef476f', ...seed.enemy },
      bossName: seed.bossName,
      hpMult: id <= 8 ? 1 + 0.4 * (id - 1) : id <= 15 ? 3.8 + 0.3 * (id - 8) : 5.9 + 0.17 * (id - 15),
      dmgMult: id <= 8 ? 1 + 0.15 * (id - 1) : id <= 15 ? 2.05 + 0.1 * (id - 8) : 2.75 + 0.05 * (id - 15),
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
