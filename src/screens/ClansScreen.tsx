import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGame } from '../lib/GameContext';
import { ConfirmModal, TopBar } from '../components/Ui';

interface ClanInfo {
  id: string;
  name: string;
  description: string;
  badge: string;
}
interface ClanListItem extends ClanInfo {
  members: number;
}
interface Member {
  username: string;
  role: string;
  chapters: number;
  is_me: boolean;
}
interface Msg {
  id: number;
  user_id: string;
  username: string;
  body: string;
  created_at: string;
}

const BADGES = ['🚀', '⭐', '🛸', '👾', '🌙', '☄️', '🪐', '🔥'];

function msg(e: { message: string } | null): string | null {
  if (!e) return null;
  if (e.message.toLowerCase().includes('fetch')) return 'Impossible de joindre le serveur.';
  return e.message;
}

export function ClansScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [loading, setLoading] = useState(true);
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('clans').select('id, name, description, badge').maybeSingle();
    setClan((data as ClanInfo | null) ?? null);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="screen">
      <TopBar title="Clans" onBack={onBack} />
      <div className="scroll">
        {loading ? (
          <p className="legend">Chargement…</p>
        ) : clan ? (
          <MyClan clan={clan} myId={g.session?.user.id ?? ''} onLeft={() => { setClan(null); setToast('Tu as quitté le clan'); }} />
        ) : (
          <NoClan onJoined={(m) => { setToast(m); void load(); }} />
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function NoClan({ onJoined }: { onJoined: (m: string) => void }) {
  const [tab, setTab] = useState<'join' | 'create'>('join');
  const [q, setQ] = useState('');
  const [list, setList] = useState<ClanListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [badge, setBadge] = useState(BADGES[0]);

  const search = useCallback(async (text: string) => {
    const { data, error } = await supabase.rpc('search_clans', { p_query: text });
    if (error) setErr(msg(error));
    else setList((data as ClanListItem[] | null) ?? []);
  }, []);
  useEffect(() => {
    void search('');
  }, [search]);

  async function join(c: ClanListItem) {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc('join_clan', { p_clan: c.id });
    setBusy(false);
    if (error) setErr(msg(error));
    else onJoined(`Bienvenue dans ${c.name} !`);
  }
  async function create() {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc('create_clan', { p_name: name, p_description: desc, p_badge: badge });
    setBusy(false);
    if (error) setErr(msg(error));
    else onJoined(`Clan ${name.trim()} créé !`);
  }

  return (
    <>
      <p className="legend">Tu n'as pas encore de clan. Rejoins-en un ou crée le tien pour discuter avec d'autres pilotes !</p>
      <div className="clan-tabs">
        <button className={`btn btn-small ${tab === 'join' ? 'btn-yellow' : 'btn-grey'}`} onClick={() => setTab('join')}>
          Rejoindre
        </button>
        <button className={`btn btn-small ${tab === 'create' ? 'btn-yellow' : 'btn-grey'}`} onClick={() => setTab('create')}>
          Créer
        </button>
      </div>
      {err && <p className="modal-error">{err}</p>}

      {tab === 'join' ? (
        <section className="chapter">
          <form
            className="clan-search"
            onSubmit={(e) => {
              e.preventDefault();
              void search(q);
            }}
          >
            <input className="input" value={q} maxLength={20} placeholder="Chercher un clan…" onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-small btn-blue" type="submit">
              🔍
            </button>
          </form>
          {list.length === 0 ? (
            <p className="legend">Aucun clan trouvé. Crée le premier !</p>
          ) : (
            <ul className="clan-list">
              {list.map((c) => (
                <li key={c.id} className="clan-row">
                  <span className="clan-badge">{c.badge}</span>
                  <div className="clan-info">
                    <strong>{c.name}</strong>
                    <small>
                      {c.members}/30 membres{c.description ? ` · ${c.description}` : ''}
                    </small>
                  </div>
                  <button className="btn btn-small btn-yellow" disabled={busy || c.members >= 30} onClick={() => void join(c)}>
                    {c.members >= 30 ? 'Complet' : 'Rejoindre'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="chapter">
          <div className="clan-form">
            <label>
              Nom du clan (3 à 20 lettres)
              <input className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Description (facultatif)
              <input className="input" value={desc} maxLength={80} onChange={(e) => setDesc(e.target.value)} />
            </label>
            <div>
              Badge
              <div className="badge-row">
                {BADGES.map((b) => (
                  <button key={b} type="button" className={`badge-pick ${badge === b ? 'on' : ''}`} onClick={() => setBadge(b)}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-yellow" disabled={busy || name.trim().length < 3} onClick={() => void create()}>
              Créer mon clan
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function MyClan({ clan, myId, onLeft }: { clan: ClanInfo; myId: string; onLeft: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [m, c] = await Promise.all([
      supabase.rpc('clan_members_list'),
      supabase.from('clan_messages').select('id, user_id, username, body, created_at').order('id', { ascending: false }).limit(50),
    ]);
    if (m.data) setMembers(m.data as Member[]);
    if (c.data) setMsgs((c.data as Msg[]).slice().reverse());
  }, []);

  // Le chat se met à jour toutes les 5 secondes tant que l'écran est ouvert
  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 5000);
    return () => clearInterval(t);
  }, [refresh]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [msgs.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setErr(null);
    const { error } = await supabase.rpc('send_clan_message', { p_body: body });
    if (error) {
      setErr(msg(error));
      return;
    }
    setText('');
    void refresh();
  }
  async function leave() {
    setBusy(true);
    const { error } = await supabase.rpc('leave_clan');
    setBusy(false);
    if (error) setErr(msg(error));
    else onLeft();
    setLeaving(false);
  }

  return (
    <>
      <section className="chapter clan-head">
        <span className="clan-badge big">{clan.badge}</span>
        <div>
          <h2 className="chapter-title">{clan.name}</h2>
          {clan.description && <p className="legend">{clan.description}</p>}
        </div>
      </section>

      <section className="chapter">
        <h2 className="chapter-title">
          Membres <span>{members.length}/30</span>
        </h2>
        <ul className="clan-list">
          {members.map((m) => (
            <li key={m.username} className={`clan-row ${m.is_me ? 'me' : ''}`}>
              <span className="clan-badge">{m.role === 'chef' ? '👑' : '🧑‍🚀'}</span>
              <div className="clan-info">
                <strong>
                  {m.username}
                  {m.is_me ? ' (toi)' : ''}
                </strong>
                <small>{m.role === 'chef' ? 'Chef' : 'Membre'} · {m.chapters} niveaux réussis</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="chapter">
        <h2 className="chapter-title">
          Discussion <span>du clan</span>
        </h2>
        <div className="chat">
          {msgs.length === 0 && <p className="legend">Aucun message. Dis bonjour !</p>}
          {msgs.map((m) => (
            <div key={m.id} className={`chat-msg ${m.user_id === myId ? 'mine' : ''}`}>
              <strong>{m.username}</strong>
              <span>{m.body}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {err && <p className="modal-error">{err}</p>}
        <form
          className="clan-search"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input className="input" value={text} maxLength={200} placeholder="Ton message…" onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-small btn-yellow" type="submit" disabled={!text.trim()}>
            Envoyer
          </button>
        </form>
        <p className="legend">Reste gentil : pas d'insultes ni de liens.</p>
      </section>

      <button className="btn btn-small btn-red clan-leave" onClick={() => setLeaving(true)}>
        Quitter le clan
      </button>
      {leaving && (
        <ConfirmModal title="Quitter le clan ?" confirmLabel="Quitter" busy={busy} onConfirm={() => void leave()} onClose={() => setLeaving(false)}>
          <p>Tu pourras en rejoindre un autre ou en créer un nouveau.</p>
        </ConfirmModal>
      )}
    </>
  );
}
