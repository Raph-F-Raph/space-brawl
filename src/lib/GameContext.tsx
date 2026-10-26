import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Character, Profile, Progress, Ship } from '../types';

interface GameState {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  characters: Character[];
  ships: Ship[];
  ownedCharacters: Set<string>;
  ownedShips: Set<string>;
  characterLevels: Record<string, number>; // niveau de chaque personnage possédé
  shipLevels: Record<string, number>;
  charLevel: number; // niveau du personnage sélectionné
  shipLevel: number; // niveau de la soucoupe sélectionnée
  progress: Progress[];
  character: Character | null; // personnage sélectionné
  ship: Ship | null; // soucoupe sélectionnée
  clearedLevel: (chapter: number) => number;
  signUp: (username: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  selectCharacter: (id: string) => Promise<void>;
  selectShip: (id: string) => Promise<void>;
  finishLevel: (chapter: number, level: number, coins: number, won: boolean) => Promise<void>;
  // Boutique : renvoient null si tout va bien, sinon un message d'erreur à afficher
  buyCharacter: (id: string) => Promise<string | null>;
  buyShip: (id: string) => Promise<string | null>;
  upgradeCharacter: (id: string) => Promise<string | null>;
  upgradeShip: (id: string) => Promise<string | null>;
  claimDailyGift: () => Promise<string | null>;
}

const Ctx = createContext<GameState | null>(null);

export function useGame(): GameState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame doit être utilisé dans <GameProvider>');
  return v;
}

function frenchError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou mot de passe incorrect.';
  if (m.includes('already registered')) return 'Cet e-mail a déjà un compte. Connecte-toi.';
  if (m.includes('password should be')) return 'Mot de passe trop court (6 caractères minimum).';
  if (m.includes('email not confirmed')) return "Confirme d'abord ton e-mail (regarde ta boîte de réception).";
  if (m.includes('rate limit')) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (m.includes('fetch')) return 'Impossible de joindre le serveur. Vérifie ta connexion.';
  return message;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [ownedCharacters, setOwnedCharacters] = useState<Set<string>>(new Set());
  const [ownedShips, setOwnedShips] = useState<Set<string>>(new Set());
  const [characterLevels, setCharacterLevels] = useState<Record<string, number>>({});
  const [shipLevels, setShipLevels] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<Progress[]>([]);

  const loadData = useCallback(async (userId: string) => {
    const [p, ch, sh, pc, ps, pr] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('characters').select('*').order('sort_order'),
      supabase.from('ships').select('*').order('sort_order'),
      supabase.from('player_characters').select('character_id, level').eq('user_id', userId),
      supabase.from('player_ships').select('ship_id, level').eq('user_id', userId),
      supabase.from('player_progress').select('chapter, cleared_level').eq('user_id', userId),
    ]);
    setProfile((p.data as Profile | null) ?? null);
    setCharacters((ch.data as Character[] | null) ?? []);
    setShips((sh.data as Ship[] | null) ?? []);
    const pcRows = (pc.data ?? []) as { character_id: string; level: number | null }[];
    const psRows = (ps.data ?? []) as { ship_id: string; level: number | null }[];
    setOwnedCharacters(new Set(pcRows.map((r) => r.character_id)));
    setOwnedShips(new Set(psRows.map((r) => r.ship_id)));
    setCharacterLevels(Object.fromEntries(pcRows.map((r) => [r.character_id, r.level ?? 1])));
    setShipLevels(Object.fromEntries(psRows.map((r) => [r.ship_id, r.level ?? 1])));
    setProgress((pr.data as Progress[] | null) ?? []);
  }, []);

  // Session au démarrage + à chaque connexion / déconnexion
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) await loadData(data.session.user.id);
      if (alive) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        // On sort du callback avant d'appeler Supabase (évite un blocage connu)
        setTimeout(() => void loadData(s.user.id), 0);
      } else {
        setProfile(null);
        setOwnedCharacters(new Set());
        setOwnedShips(new Set());
        setCharacterLevels({});
        setShipLevels({});
        setProgress([]);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadData]);

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return frenchError(error.message);
    if (!data.session) {
      return "Compte créé ! Confirme ton e-mail (regarde ta boîte de réception), puis connecte-toi.";
    }
    return null;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? frenchError(error.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const selectCharacter = useCallback(
    async (id: string) => {
      if (!session) return;
      // Affichage immédiat, puis confirmation par le serveur
      setProfile((p) => (p ? { ...p, selected_character: id } : p));
      const { error } = await supabase.rpc('select_character', { p_character: id });
      if (error) await loadData(session.user.id);
    },
    [session, loadData]
  );

  const selectShip = useCallback(
    async (id: string) => {
      if (!session) return;
      setProfile((p) => (p ? { ...p, selected_ship: id } : p));
      const { error } = await supabase.rpc('select_ship', { p_ship: id });
      if (error) await loadData(session.user.id);
    },
    [session, loadData]
  );

  const finishLevel = useCallback(
    async (chapter: number, level: number, coins: number, won: boolean) => {
      if (!session) return;
      await supabase.rpc('complete_level', {
        p_chapter: chapter,
        p_level: level,
        p_coins: coins,
        p_won: won,
      });
      await loadData(session.user.id);
    },
    [session, loadData]
  );

  // Après chaque achat (réussi ou non) on recharge les données pour rester synchronisé avec le serveur
  const buyCharacter = useCallback(
    async (id: string) => {
      if (!session) return 'Connexion requise';
      const { error } = await supabase.rpc('buy_character', { p_character: id });
      await loadData(session.user.id);
      return error ? frenchError(error.message) : null;
    },
    [session, loadData]
  );

  const buyShip = useCallback(
    async (id: string) => {
      if (!session) return 'Connexion requise';
      const { error } = await supabase.rpc('buy_ship', { p_ship: id });
      await loadData(session.user.id);
      return error ? frenchError(error.message) : null;
    },
    [session, loadData]
  );

  const upgradeCharacter = useCallback(
    async (id: string) => {
      if (!session) return 'Connexion requise';
      const { error } = await supabase.rpc('upgrade_character', { p_character: id });
      await loadData(session.user.id);
      return error ? frenchError(error.message) : null;
    },
    [session, loadData]
  );

  const upgradeShip = useCallback(
    async (id: string) => {
      if (!session) return 'Connexion requise';
      const { error } = await supabase.rpc('upgrade_ship', { p_ship: id });
      await loadData(session.user.id);
      return error ? frenchError(error.message) : null;
    },
    [session, loadData]
  );

  const claimDailyGift = useCallback(async () => {
    if (!session) return 'Connexion requise';
    const { error } = await supabase.rpc('claim_daily_gift');
    await loadData(session.user.id);
    return error ? frenchError(error.message) : null;
  }, [session, loadData]);

  const clearedLevel = useCallback(
    (chapter: number) => progress.find((p) => p.chapter === chapter)?.cleared_level ?? 0,
    [progress]
  );

  const character = useMemo(
    () => characters.find((c) => c.id === profile?.selected_character) ?? null,
    [characters, profile]
  );
  const ship = useMemo(
    () => ships.find((s) => s.id === profile?.selected_ship) ?? null,
    [ships, profile]
  );

  const value: GameState = {
    loading,
    session,
    profile,
    characters,
    ships,
    ownedCharacters,
    ownedShips,
    characterLevels,
    shipLevels,
    charLevel: character ? characterLevels[character.id] ?? 1 : 1,
    shipLevel: ship ? shipLevels[ship.id] ?? 1 : 1,
    progress,
    character,
    ship,
    clearedLevel,
    signUp,
    signIn,
    signOut,
    selectCharacter,
    selectShip,
    finishLevel,
    buyCharacter,
    buyShip,
    upgradeCharacter,
    upgradeShip,
    claimDailyGift,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
