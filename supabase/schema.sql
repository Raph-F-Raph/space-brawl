-- =====================================================================
-- Space Brawl : schéma Supabase
-- À coller dans Supabase -> SQL Editor -> New query -> Run
-- Tu peux le relancer sans risque : il ne casse rien s'il existe déjà.
-- =====================================================================

-- ---------- Tables du catalogue (lisibles par tous les joueurs connectés) ----------

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  rarity text not null check (rarity in ('common','rare','epic','legendary')),
  hp int not null,
  strength int not null,
  resistance int not null,
  attack_type text not null,            -- nom affiché : "Tir laser", ...
  attack_kind text not null check (attack_kind in ('laser','burst','pierce','shockwave')),
  color text not null,
  accent text not null,
  price int not null default 0,         -- 0 = personnage de départ
  sort_order int not null default 0
);

create table if not exists public.ships (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  rarity text not null check (rarity in ('common','rare','epic','legendary')),
  hp int not null,
  strength int not null,
  resistance int not null,
  speed int not null,
  color text not null,
  accent text not null,
  price int not null default 0,
  sort_order int not null default 0
);

-- ---------- Données du joueur ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  coins int not null default 100 check (coins >= 0),
  gems int not null default 10 check (gems >= 0),
  selected_character uuid references public.characters(id),
  selected_ship uuid references public.ships(id),
  created_at timestamptz not null default now()
);

create table if not exists public.player_characters (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  primary key (user_id, character_id)
);

create table if not exists public.player_ships (
  user_id uuid not null references auth.users(id) on delete cascade,
  ship_id uuid not null references public.ships(id) on delete cascade,
  primary key (user_id, ship_id)
);

-- cleared_level = dernier niveau terminé du chapitre (0 = aucun)
create table if not exists public.player_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter int not null,
  cleared_level int not null default 0,
  primary key (user_id, chapter)
);

-- ---------- Sécurité (RLS) : chaque joueur ne voit que ses données ----------

alter table public.characters enable row level security;
alter table public.ships enable row level security;
alter table public.profiles enable row level security;
alter table public.player_characters enable row level security;
alter table public.player_ships enable row level security;
alter table public.player_progress enable row level security;

drop policy if exists "catalogue personnages lisible" on public.characters;
create policy "catalogue personnages lisible" on public.characters
  for select to authenticated using (true);

drop policy if exists "catalogue soucoupes lisible" on public.ships;
create policy "catalogue soucoupes lisible" on public.ships
  for select to authenticated using (true);

drop policy if exists "profil: lecture perso" on public.profiles;
create policy "profil: lecture perso" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "personnages possédés: lecture perso" on public.player_characters;
create policy "personnages possédés: lecture perso" on public.player_characters
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "soucoupes possédées: lecture perso" on public.player_ships;
create policy "soucoupes possédées: lecture perso" on public.player_ships
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "progression: lecture perso" on public.player_progress;
create policy "progression: lecture perso" on public.player_progress
  for select to authenticated using (user_id = auth.uid());

-- Aucune politique d'écriture : le joueur ne peut PAS modifier ses pièces
-- directement. Tout passe par les fonctions sécurisées plus bas.

-- ---------- Création automatique du profil à l'inscription ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_char uuid;
  v_ship uuid;
  v_name text;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'Pilote');

  select id into v_char from public.characters where price = 0 order by sort_order limit 1;
  select id into v_ship  from public.ships      where price = 0 order by sort_order limit 1;

  insert into public.profiles (id, username, selected_character, selected_ship)
  values (new.id, left(v_name, 20), v_char, v_ship);

  if v_char is not null then
    insert into public.player_characters (user_id, character_id) values (new.id, v_char);
  end if;
  if v_ship is not null then
    insert into public.player_ships (user_id, ship_id) values (new.id, v_ship);
  end if;

  insert into public.player_progress (user_id, chapter, cleared_level) values (new.id, 1, 0);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction interne : personne ne doit pouvoir l'appeler depuis l'extérieur
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------- Fonctions sécurisées appelées par l'app ----------

-- Choisir son personnage (il faut le posséder)
create or replace function public.select_character(p_character uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.player_characters
    where user_id = auth.uid() and character_id = p_character
  ) then
    raise exception 'Personnage non possédé';
  end if;
  update public.profiles set selected_character = p_character where id = auth.uid();
end;
$$;

-- Choisir sa soucoupe (il faut la posséder)
create or replace function public.select_ship(p_ship uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.player_ships
    where user_id = auth.uid() and ship_id = p_ship
  ) then
    raise exception 'Soucoupe non possédée';
  end if;
  update public.profiles set selected_ship = p_ship where id = auth.uid();
end;
$$;

-- Enregistrer le résultat d'un niveau du mode Chapitres.
-- Les pièces gagnées sont plafonnées pour limiter la triche (le vrai
-- contrôle serveur viendra avec le mode en ligne).
create or replace function public.complete_level(
  p_chapter int,
  p_level int,
  p_coins int,
  p_won boolean
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cleared int;
  v_coins int;
  v_gems int := 0;
  v_total int;
begin
  if p_level < 1 or p_level > 5 then
    raise exception 'Niveau invalide';
  end if;

  insert into public.player_progress (user_id, chapter, cleared_level)
  values (auth.uid(), p_chapter, 0)
  on conflict (user_id, chapter) do nothing;

  select cleared_level into v_cleared
  from public.player_progress
  where user_id = auth.uid() and chapter = p_chapter;

  if p_level > v_cleared + 1 then
    raise exception 'Niveau pas encore débloqué';
  end if;

  v_coins := greatest(0, least(p_coins, 400));

  if p_won and p_level > v_cleared then
    update public.player_progress
      set cleared_level = p_level
      where user_id = auth.uid() and chapter = p_chapter;
    -- le méga boss (niveau 5) donne 5 gemmes, la première fois seulement
    if p_level = 5 then
      v_gems := 5;
    end if;
  end if;

  update public.profiles
    set coins = coins + v_coins, gems = gems + v_gems
    where id = auth.uid()
    returning coins into v_total;

  return v_total;
end;
$$;

-- Seuls les joueurs connectés peuvent appeler ces fonctions
revoke all on function public.select_character(uuid) from public, anon;
revoke all on function public.select_ship(uuid) from public, anon;
revoke all on function public.complete_level(int, int, int, boolean) from public, anon;
grant execute on function public.select_character(uuid) to authenticated;
grant execute on function public.select_ship(uuid) to authenticated;
grant execute on function public.complete_level(int, int, int, boolean) to authenticated;

-- ---------- Boutique ----------

-- Acheter un personnage avec des pièces
create or replace function public.buy_character(p_character uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price int;
  v_coins int;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  select price into v_price from public.characters where id = p_character;
  if v_price is null then
    raise exception 'Personnage inconnu';
  end if;
  if exists (
    select 1 from public.player_characters
    where user_id = auth.uid() and character_id = p_character
  ) then
    raise exception 'Tu possèdes déjà ce personnage';
  end if;
  update public.profiles
    set coins = coins - v_price
    where id = auth.uid() and coins >= v_price
    returning coins into v_coins;
  if v_coins is null then
    raise exception 'Pas assez de pièces';
  end if;
  insert into public.player_characters (user_id, character_id) values (auth.uid(), p_character);
  return v_coins;
end;
$$;

-- Acheter une soucoupe avec des pièces
create or replace function public.buy_ship(p_ship uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price int;
  v_coins int;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  select price into v_price from public.ships where id = p_ship;
  if v_price is null then
    raise exception 'Soucoupe inconnue';
  end if;
  if exists (
    select 1 from public.player_ships
    where user_id = auth.uid() and ship_id = p_ship
  ) then
    raise exception 'Tu possèdes déjà cette soucoupe';
  end if;
  update public.profiles
    set coins = coins - v_price
    where id = auth.uid() and coins >= v_price
    returning coins into v_coins;
  if v_coins is null then
    raise exception 'Pas assez de pièces';
  end if;
  insert into public.player_ships (user_id, ship_id) values (auth.uid(), p_ship);
  return v_coins;
end;
$$;

-- Échanger des gemmes contre des pièces (1 gemme = 20 pièces)
create or replace function public.exchange_gems(p_gems int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coins int;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  if p_gems is null or p_gems < 1 or p_gems > 1000 then
    raise exception 'Quantité invalide';
  end if;
  update public.profiles
    set gems = gems - p_gems, coins = coins + p_gems * 20
    where id = auth.uid() and gems >= p_gems
    returning coins into v_coins;
  if v_coins is null then
    raise exception 'Pas assez de gemmes';
  end if;
  return v_coins;
end;
$$;

revoke all on function public.buy_character(uuid) from public, anon;
revoke all on function public.buy_ship(uuid) from public, anon;
revoke all on function public.exchange_gems(int) from public, anon;
grant execute on function public.buy_character(uuid) to authenticated;
grant execute on function public.buy_ship(uuid) to authenticated;
grant execute on function public.exchange_gems(int) to authenticated;

-- ---------- Comptes déjà existants (créés avant ce script) ----------
-- Donne un profil de départ aux comptes qui n'en ont pas encore.
-- On le place APRÈS les données de départ (voir plus bas) : c'est pourquoi
-- il est dans une fonction appelée tout à la fin du script.
create or replace function public.backfill_profiles()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u record;
  v_char uuid;
  v_ship uuid;
begin
  select id into v_char from public.characters where price = 0 order by sort_order limit 1;
  select id into v_ship  from public.ships      where price = 0 order by sort_order limit 1;

  for u in
    select id, raw_user_meta_data from auth.users
    where id not in (select id from public.profiles)
  loop
    insert into public.profiles (id, username, selected_character, selected_ship)
    values (
      u.id,
      coalesce(nullif(left(trim(u.raw_user_meta_data->>'username'), 20), ''), 'Pilote'),
      v_char,
      v_ship
    );
    if v_char is not null then
      insert into public.player_characters (user_id, character_id) values (u.id, v_char)
      on conflict do nothing;
    end if;
    if v_ship is not null then
      insert into public.player_ships (user_id, ship_id) values (u.id, v_ship)
      on conflict do nothing;
    end if;
    insert into public.player_progress (user_id, chapter, cleared_level) values (u.id, 1, 0)
    on conflict do nothing;
  end loop;
end;
$$;
revoke all on function public.backfill_profiles() from public, anon, authenticated;

-- ---------- Données de départ ----------

insert into public.characters (name, rarity, hp, strength, resistance, attack_type, attack_kind, color, accent, price, sort_order) values
  ('Cosmo', 'common',    100, 10,  5, 'Tir laser',       'laser',     '#4cc9f0', '#ffd23f', 0,    1),
  ('Nova',  'rare',       80, 14,  3, 'Rafale',          'burst',     '#ff6b9d', '#fff3b0', 500,  2),
  ('Volt',  'epic',       90, 12,  6, 'Éclair perçant',  'pierce',    '#b5f23d', '#3a0ca3', 1500, 3),
  ('Titan', 'legendary', 160,  9, 12, 'Onde de choc',    'shockwave', '#ff9f1c', '#2b2d42', 4000, 4)
on conflict (name) do nothing;

insert into public.ships (name, rarity, hp, strength, resistance, speed, color, accent, price, sort_order) values
  ('UFO-Alpha',   'common',    100,  5,  5, 5, '#9aa7c7', '#ffd23f', 0,    1),
  ('Star Cruiser','rare',      140,  6,  9, 4, '#4895ef', '#f72585', 600,  2),
  ('Nebula Disc', 'epic',       90,  9,  4, 7, '#9d4edd', '#7bf1a8', 1800, 3),
  ('Comet X',     'legendary', 110, 11,  6, 9, '#ff5d8f', '#ffd23f', 4500, 4)
on conflict (name) do nothing;

-- ---------- Dernière étape : profils des comptes déjà existants ----------
select public.backfill_profiles();
