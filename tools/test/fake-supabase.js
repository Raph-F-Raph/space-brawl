(function () {
  // Fausse base Supabase pour les tests : mêmes règles que les fonctions SQL (prix en gemmes, niveaux, cadeau, récompenses).
  const chars = [
    { id: 'c1', name: 'Cosmo', rarity: 'common', hp: 100, strength: 10, resistance: 5, attack_type: 'Tir laser', attack_kind: 'laser', color: '#4cc9f0', accent: '#ffd23f', price: 0, sort_order: 1 },
    { id: 'c2', name: 'Nova', rarity: 'rare', hp: 80, strength: 14, resistance: 3, attack_type: 'Rafale', attack_kind: 'burst', color: '#ff6b9d', accent: '#fff3b0', price: 20, sort_order: 2 },
    { id: 'c3', name: 'Volt', rarity: 'epic', hp: 90, strength: 12, resistance: 6, attack_type: 'Éclair perçant', attack_kind: 'pierce', color: '#b5f23d', accent: '#3a0ca3', price: 60, sort_order: 3 },
    { id: 'c4', name: 'Titan', rarity: 'legendary', hp: 160, strength: 9, resistance: 12, attack_type: 'Onde de choc', attack_kind: 'shockwave', color: '#ff9f1c', accent: '#2b2d42', price: 120, sort_order: 4 },
    { id: 'c5', name: 'Frelon', rarity: 'epic', hp: 110, strength: 13, resistance: 7, attack_type: 'Dard fulgurant', attack_kind: 'pierce', color: '#1b1b1f', accent: '#ffd400', price: 100, sort_order: 5 },
  ];
  const ships = [
    { id: 's1', name: 'UFO-Alpha', rarity: 'common', hp: 100, strength: 5, resistance: 5, speed: 5, color: '#9aa7c7', accent: '#ffd23f', price: 0, sort_order: 1 },
    { id: 's2', name: 'Star Cruiser', rarity: 'rare', hp: 140, strength: 6, resistance: 9, speed: 4, color: '#4895ef', accent: '#f72585', price: 20, sort_order: 2 },
    { id: 's3', name: 'Nebula Disc', rarity: 'epic', hp: 90, strength: 9, resistance: 4, speed: 7, color: '#9d4edd', accent: '#7bf1a8', price: 60, sort_order: 3 },
    { id: 's4', name: 'Comet X', rarity: 'legendary', hp: 110, strength: 11, resistance: 6, speed: 9, color: '#ff5d8f', accent: '#ffd23f', price: 120, sort_order: 4 },
    { id: 's5', name: 'Aiguillon', rarity: 'epic', hp: 100, strength: 10, resistance: 5, speed: 8, color: '#1b1b1f', accent: '#ffd400', price: 100, sort_order: 5 },
  ];
  const st = { session: null, profile: null, ownC: { c1: 1 }, ownS: { s1: 1 }, progress: [{ chapter: 1, cleared_level: window.__startCleared ?? 0 }], calls: [], today: '2026-10-26' };
  const L = [];
  const mk = () => ({ access_token: 't', user: { id: 'u1', email: 'a@b.c' } });
  const fire = (ev) => L.forEach((f) => f(ev, st.session));
  const auth = {
    getSession: async () => ({ data: { session: st.session } }),
    onAuthStateChange(cb) { L.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    async signUp({ options }) {
      st.profile = { id: 'u1', username: options.data.username, coins: window.__startCoins ?? 100, gems: window.__startGems ?? 10, selected_character: 'c1', selected_ship: 's1', last_daily: null };
      st.session = mk(); fire('SIGNED_IN'); return { data: { session: st.session }, error: null };
    },
    async signInWithPassword() { st.session = mk(); fire('SIGNED_IN'); return { error: null }; },
    async signOut() { st.session = null; fire('SIGNED_OUT'); },
  };
  function from(t) {
    const q = {
      select() { return q; }, eq() { return q; }, order() { return q; },
      rows() {
        if (t === 'profiles') return st.profile ? [st.profile] : [];
        if (t === 'characters') return chars;
        if (t === 'ships') return ships;
        if (t === 'player_characters') return Object.entries(st.ownC).map(([id, level]) => ({ character_id: id, level }));
        if (t === 'player_ships') return Object.entries(st.ownS).map(([id, level]) => ({ ship_id: id, level }));
        if (t === 'player_progress') return st.progress;
        return [];
      },
      async maybeSingle() { return { data: q.rows()[0] ?? null, error: null }; },
      then(res, rej) { return Promise.resolve({ data: q.rows(), error: null }).then(res, rej); },
    };
    return q;
  }
  const fail = (m) => ({ data: null, error: { message: m } });
  async function rpc(name, a) {
    st.calls.push([name, a]);
    const P = st.profile;
    if (name === 'select_character') P.selected_character = a.p_character;
    if (name === 'select_ship') P.selected_ship = a.p_ship;
    if (name === 'buy_character' || name === 'buy_ship') {
      const list = name === 'buy_character' ? chars : ships;
      const own = name === 'buy_character' ? st.ownC : st.ownS;
      const id = a.p_character ?? a.p_ship;
      const it = list.find((x) => x.id === id);
      if (!it) return fail('Objet inconnu');
      if (own[id]) return fail('Tu possèdes déjà cet objet');
      if (P.gems < it.price) return fail('Pas assez de gemmes');
      P.gems -= it.price; own[id] = 1;
    }
    if (name === 'upgrade_character' || name === 'upgrade_ship') {
      const own = name === 'upgrade_character' ? st.ownC : st.ownS;
      const id = a.p_character ?? a.p_ship;
      if (!own[id]) return fail('Tu ne possèdes pas cet objet');
      if (own[id] >= 10) return fail('Niveau maximum atteint');
      const cost = 60 * own[id];
      if (P.coins < cost) return fail('Pas assez de pièces');
      P.coins -= cost; own[id] += 1;
    }
    if (name === 'claim_daily_gift') {
      if (P.last_daily === st.today) return fail("Cadeau déjà récupéré aujourd'hui");
      P.gems += 1; P.coins += 30; P.last_daily = st.today;
    }
    if (name === 'complete_level') {
      if (a.p_chapter < 1 || a.p_chapter > 6) return fail('Chapitre invalide');
      const get = (c) => st.progress.find((x) => x.chapter === c);
      if (a.p_chapter > 1 && (get(a.p_chapter - 1)?.cleared_level ?? 0) < 5) return fail('Chapitre pas encore débloqué');
      let p = get(a.p_chapter);
      if (!p) { p = { chapter: a.p_chapter, cleared_level: 0 }; st.progress.push(p); }
      if (a.p_level > p.cleared_level + 1) return fail('Niveau pas encore débloqué');
      P.coins += Math.max(0, Math.min(a.p_coins, 250));
      if (a.p_won && a.p_level > p.cleared_level) { p.cleared_level = a.p_level; P.gems += a.p_level === 5 ? 15 : 0; }
    }
    return { data: null, error: null };
  }
  window.__fake = st;
  window.supabase = { createClient: () => ({ auth, from, rpc }) };
})();
