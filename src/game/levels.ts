export type EnemyKind = 'grunt' | 'fast' | 'tank' | 'minion' | 'boss';

export interface WaveEntry {
  kind: EnemyKind;
  count: number;
}

export interface LevelDef {
  level: number;
  name: string;
  waves: WaveEntry[][]; // une vague = une liste de groupes d'ennemis
  isBoss: boolean;
  bonus: number; // pièces bonus à la victoire
}

export interface ChapterDef {
  id: number;
  name: string;
  levels: LevelDef[];
}

// Pour ajouter des niveaux ou un chapitre : copie un bloc ci-dessous et change les nombres.
export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    name: "La ceinture d'astéroïdes",
    levels: [
      {
        level: 1,
        name: 'Premier contact',
        isBoss: false,
        bonus: 20,
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
        level: 2,
        name: 'Champ de débris',
        isBoss: false,
        bonus: 30,
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
        level: 3,
        name: 'Pluie de météores',
        isBoss: false,
        bonus: 40,
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
        level: 4,
        name: 'Base ennemie',
        isBoss: false,
        bonus: 50,
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
        level: 5,
        name: 'MÉGA BOSS : Gorgonax',
        isBoss: true,
        bonus: 100,
        waves: [[{ kind: 'minion', count: 6 }], [{ kind: 'boss', count: 1 }]],
      },
    ],
  },
];

export function getLevel(chapter: number, level: number): LevelDef {
  const c = CHAPTERS.find((x) => x.id === chapter) ?? CHAPTERS[0];
  return c.levels.find((l) => l.level === level) ?? c.levels[0];
}
