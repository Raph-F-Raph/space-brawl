-- =====================================================================
-- ⚠️  ATTENTION : ce script SUPPRIME les tables du jeu et toutes leurs données.
-- À utiliser UNIQUEMENT si ton projet Supabase contient l'ancienne version
-- créée avec Bolt et que tu n'as rien à garder (comptes de test, etc.).
--
-- Ordre à suivre :  1) reset.sql   2) schema.sql
--
-- Les comptes de connexion (Authentication -> Users) ne sont PAS supprimés :
-- schema.sql leur redonnera automatiquement un profil de départ
-- (100 pièces, 10 gemmes, personnage et soucoupe de départ).
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.select_character(uuid) cascade;
drop function if exists public.select_ship(uuid) cascade;
drop function if exists public.complete_level(int, int, int, boolean) cascade;
drop function if exists public.backfill_profiles() cascade;

drop table if exists public.player_progress cascade;
drop table if exists public.player_ships cascade;
drop table if exists public.player_characters cascade;
drop table if exists public.profiles cascade;
drop table if exists public.ships cascade;
drop table if exists public.characters cascade;
