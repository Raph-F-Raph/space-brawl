(function () {
  const chars = [
    { id: 'c1', name: 'Cosmo', rarity: 'common', hp: 100, strength: 10, resistance: 5, attack_type: 'Tir laser', attack_kind: 'laser', color: '#4cc9f0', accent: '#ffd23f', price: 0, sort_order: 1 },
    { id: 'c2', name: 'Nova', rarity: 'rare', hp: 80, strength: 14, resistance: 3, attack_type: 'Rafale', attack_kind: 'burst', color: '#ff6b9d', accent: '#fff3b0', price: 500, sort_order: 2 },
    { id: 'c3', name: 'Volt', rarity: 'epic', hp: 90, strength: 12, resistance: 6, attack_type: 'Éclair perçant', attack_kind: 'pierce', color: '#b5f23d', accent: '#3a0ca3', price: 1500, sort_order: 3 },
    { id: 'c5', name: 'Frelon', rarity: 'epic', hp: 110, strength: 13, resistance: 7, attack_type: 'Dard fulgurant', attack_kind: 'pierce', color: '#1b1b1f', accent: '#ffd400', price: 2500, sort_order: 5 },
    { id: 'c4', name: 'Titan', rarity: 'legendary', hp: 160, strength: 9, resistance: 12, attack_type: 'Onde de choc', attack_kind: 'shockwave', color: '#ff9f1c', accent: '#2b2d42', price: 4000, sort_order: 4 },
  ];
  const ships = [
    { id: 's1', name: 'UFO-Alpha', rarity: 'common', hp: 100, strength: 5, resistance: 5, speed: 5, color: '#9aa7c7', accent: '#ffd23f', price: 0, sort_order: 1 },
    { id: 's2', name: 'Star Cruiser', rarity: 'rare', hp: 140, strength: 6, resistance: 9, speed: 4, color: '#4895ef', accent: '#f72585', price: 600, sort_order: 2 },
    { id: 's3', name: 'Nebula Disc', rarity: 'epic', hp: 90, strength: 9, resistance: 4, speed: 7, color: '#9d4edd', accent: '#7bf1a8', price: 1800, sort_order: 3 },
    { id: 's4', name: 'Comet X', rarity: 'legendary', hp: 110, strength: 11, resistance: 6, speed: 9, color: '#ff5d8f', accent: '#ffd23f', price: 4500, sort_order: 4 },
  ];
  const st = { session: null, profile: null, ownC: ['c1'], ownS: ['s1'], progress: [{ chapter: 1, cleared_level: 0 }], calls: [] };
  const L = [];
  const mk = () => ({ access_token: 't', user: { id: 'u1', email: 'a@b.c' } });
  const fire = (ev) => L.forEach((f) => f(ev, st.session));
  const auth = {
    getSession: async () => ({ data: { session: st.session } }),
    onAuthStateChange(cb) { L.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    async signUp({ options }) {
      st.profile = { id: 'u1', username: options.data.username, coins: window.__startCoins ?? 100, gems: 10, selected_character: 'c1', selected_ship: 's1' };
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
        if (t === 'player_characters') return st.ownC.map((id) => ({ character_id: id }));
        if (t === 'player_ships') return st.ownS.map((id) => ({ ship_id: id }));
        if (t === 'player_progress') return st.progress;
        return [];
      },
      async maybeSingle() { return { data: q.rows()[0] ?? null, error: null }; },
      then(res, rej) { return Promise.resolve({ data: q.rows(), error: null }).then(res, rej); },
    };
    return q;
  }
  async function rpc(name, a) {
    st.calls.push([name, a]);
    if (name === 'select_character') st.profile.selected_character = a.p_character;
    if (name === 'select_ship') st.profile.selected_ship = a.p_ship;
    const fail = (m) => ({ data: null, error: { message: m } });
    if (name === 'buy_character' || name === 'buy_ship') {
      const list = name === 'buy_character' ? chars : ships;
      const own = name === 'buy_character' ? st.ownC : st.ownS;
      const id = a.p_character ?? a.p_ship;
      const it = list.find((x) => x.id === id);
      if (!it) return fail('Objet inconnu');
      if (own.includes(id)) return fail('Tu possèdes déjà cet objet');
      if (st.profile.coins < it.price) return fail('Pas assez de pièces');
      st.profile.coins -= it.price; own.push(id);
    }
    if (name === 'exchange_gems') {
      if (st.profile.gems < a.p_gems) return fail('Pas assez de gemmes');
      st.profile.gems -= a.p_gems; st.profile.coins += a.p_gems * 20;
    }
    if (name === 'complete_level') {
      st.profile.coins += Math.max(0, Math.min(a.p_coins, 400));
      const p = st.progress[0];
      if (a.p_won && a.p_level > p.cleared_level) p.cleared_level = a.p_level;
    }
    return { data: null, error: null };
  }
  window.__fake = st;
  window.supabase = { createClient: () => ({ auth, from, rpc }) };
})();
