import { supabase } from './supabase';
import type { PlayerStats } from '../game/engine';
import type { InputMsg, ResultMsg, StartMsg, StateMsg } from '../game/arena';

// Salon entre amis : un canal Supabase Realtime par salon.
// L'hôte (celui qui a créé le salon) calcule toute la partie, les invités envoient leurs commandes et affichent le résultat.

export const MAX_HUMANS = 4; // au-delà, les robots complètent jusqu'à 8 pilotes

export interface LobbyPlayer {
  key: string;
  name: string;
  host: boolean;
  joinedAt: number;
  stats: PlayerStats;
}

export interface StartPayload extends StartMsg {
  ids: Record<string, number>; // clé du joueur -> numéro de pilote
}

type Handlers = {
  lobby: (players: LobbyPlayer[]) => void;
  start: (m: StartPayload) => void;
  input: (id: number, m: InputMsg) => void;
  state: (m: StateMsg) => void;
  result: (m: ResultMsg) => void;
  hostLeft: () => void;
};

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // pas de I ni de O : on les confond avec 1 et 0

export function newCode(): string {
  let c = '';
  for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return c;
}

export class Room {
  readonly key = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  players: LobbyPlayer[] = [];
  private channel;
  private handlers: Partial<Handlers> = {};
  private hadHost = false;
  private closed = false;

  constructor(
    readonly code: string,
    readonly isHost: boolean,
    private me: { name: string; stats: PlayerStats }
  ) {
    this.channel = supabase.channel(`salon-${code}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: this.key } },
    });
  }

  on<K extends keyof Handlers>(name: K, fn: Handlers[K]) {
    this.handlers[name] = fn;
  }

  /** Se connecte au salon. Renvoie null si tout va bien, sinon un message d'erreur. */
  join(): Promise<string | null> {
    return new Promise((resolve) => {
      let done = false;
      const finish = (err: string | null) => {
        if (done) return;
        done = true;
        resolve(err);
      };
      const ch = this.channel;
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, LobbyPlayer[]>;
        const list = Object.values(state).flat();
        list.sort((a, b) => (a.host === b.host ? a.joinedAt - b.joinedAt : a.host ? -1 : 1));
        this.players = list;
        if (list.some((p) => p.host)) this.hadHost = true;
        else if (this.hadHost && !this.isHost && !this.closed) this.handlers.hostLeft?.();
        this.handlers.lobby?.(list);
      });
      ch.on('broadcast', { event: 'start' }, ({ payload }) => this.handlers.start?.(payload as StartPayload));
      ch.on('broadcast', { event: 'input' }, ({ payload }) => {
        const p = payload as { id: number; m: InputMsg };
        this.handlers.input?.(p.id, p.m);
      });
      ch.on('broadcast', { event: 'state' }, ({ payload }) => this.handlers.state?.(payload as StateMsg));
      ch.on('broadcast', { event: 'result' }, ({ payload }) => this.handlers.result?.(payload as ResultMsg));
      ch.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // un invité vérifie d'abord que le salon existe et n'est pas plein
          if (!this.isHost) {
            await new Promise((r) => setTimeout(r, 1200));
            const state = ch.presenceState() as Record<string, LobbyPlayer[]>;
            const list = Object.values(state).flat();
            if (!list.some((p) => p.host)) {
              finish('Salon introuvable. Vérifie le code.');
              void this.leave();
              return;
            }
            if (list.length >= MAX_HUMANS) {
              finish('Ce salon est plein.');
              void this.leave();
              return;
            }
          }
          await ch.track({ key: this.key, name: this.me.name, host: this.isHost, joinedAt: Date.now(), stats: this.me.stats } satisfies LobbyPlayer);
          finish(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          finish('Connexion impossible pour le moment. Réessaie.');
        }
      });
      setTimeout(() => finish('Connexion trop longue. Vérifie ton réseau.'), 12000);
    });
  }

  /** Attribue un numéro de pilote à chaque vrai joueur (l'hôte a toujours le 0). */
  assignIds(): Record<string, number> {
    const ids: Record<string, number> = {};
    this.players.slice(0, MAX_HUMANS).forEach((p, i) => (ids[p.key] = i));
    return ids;
  }

  private send(event: string, payload: unknown) {
    if (this.closed) return;
    void this.channel.send({ type: 'broadcast', event, payload });
  }
  sendStart(m: StartPayload) {
    this.send('start', m);
  }
  sendInput(id: number, m: InputMsg) {
    this.send('input', { id, m });
  }
  sendState(m: StateMsg) {
    this.send('state', m);
  }
  sendResult(m: ResultMsg) {
    this.send('result', m);
  }

  async leave() {
    if (this.closed) return;
    this.closed = true;
    try {
      await this.channel.untrack();
    } catch {
      /* rien */
    }
    await supabase.removeChannel(this.channel);
  }
}
