# Space Brawl : mise en route

Jeu mobile (PWA) en React + Supabase. Il faut faire 3 choses, dans cet ordre :
Supabase, puis GitHub, puis Netlify. Compte une heure la première fois.

> Important : ce projet n'a pas pu être lancé pendant sa préparation (pas d'accès
> à internet pour installer les outils). Si quelque chose bloque, note le message
> d'erreur exact et envoie-le moi, on corrigera.

## 1. Préparer Supabase

1. Ouvre ton projet sur supabase.com, puis **SQL Editor > New query**.
2. **Seulement si tu avais déjà des tables créées par Bolt** : colle le contenu de
   `supabase/reset.sql` et clique **Run**. Attention, ça efface les anciennes
   données du jeu (tes comptes de connexion restent).
3. Nouvelle requête : colle le contenu de `supabase/schema.sql` et clique **Run**.
   Tu peux le relancer sans danger.
4. **Authentication > Providers > Email** : pour tester vite, désactive
   « Confirm email » (tu pourras le réactiver avant la sortie du jeu).
5. **Project Settings > API** : copie deux valeurs, à garder sous la main :
   - **Project URL**
   - **anon public key**

   Ne copie et ne partage jamais la clé **service_role** : elle donne tous les droits.

## 2. Mettre le code sur GitHub

1. Sur github.com : **New repository**, nom `space-brawl`, puis **Create repository**.
2. Clique **uploading an existing file** et glisse-y **le contenu** du dossier
   `space-brawl` (pas le dossier lui-même).
3. Ne mets pas de dossier `node_modules` ni de fichier `.env`.
4. Clique **Commit changes**.

## 3. Publier avec Netlify (gratuit)

1. Sur netlify.com : **Add new site > Import an existing project > GitHub**,
   puis choisis `space-brawl`.
2. Réglages de build (normalement détectés tout seuls) :
   - Build command : `npm run build`
   - Publish directory : `dist`
3. Avant de déployer, ouvre **Environment variables** et ajoute :
   - `VITE_SUPABASE_URL` = ta Project URL
   - `VITE_SUPABASE_ANON_KEY` = ta clé anon public
4. Clique **Deploy**. Quand c'est fini, Netlify te donne une adresse (`xxx.netlify.app`).
5. Ouvre-la sur ton téléphone, crée un compte, puis « Ajouter à l'écran d'accueil »
   pour installer l'app.

## Ce qu'il faut tester en premier

- Inscription, fermeture de l'app, réouverture : tu dois rester connecté.
- Changer de personnage et de soucoupe, recharger : le choix doit rester.
- Jouer le niveau 1 : pièces gagnées, niveau 2 débloqué.
- Terminer le niveau 5 (méga boss) : le décor de l'écran d'accueil change.

## Si ça ne marche pas

| Symptôme | Cause probable |
| --- | --- |
| Message « Il manque la configuration Supabase » | Les deux variables d'environnement ne sont pas remplies sur Netlify. Corrige-les puis relance un déploiement (**Deploys > Trigger deploy**). |
| « Chargement de ton profil… » qui ne finit pas | `schema.sql` n'a pas été exécuté (étape 1.3). |
| « Confirme d'abord ton e-mail » | « Confirm email » est encore activé dans Supabase (étape 1.4). |
| Le build Netlify échoue | Copie les dernières lignes rouges du journal de déploiement. |

## Lancer sur ton ordinateur (facultatif)

Il faut Node.js. Copie `.env.example` en `.env` et remplis les deux valeurs, puis :

```
npm install
npm run dev
```

## Ajouter des niveaux ou des chapitres

Tout est dans `src/game/levels.ts` : copie un bloc de niveau et change les nombres
d'ennemis. Les personnages et soucoupes (stats, prix, couleurs) sont des lignes dans
`supabase/schema.sql`, section des données de départ.

## Plus tard : Play Store

Une fois le jeu en ligne et stable, on l'emballe en application Android avec
PWABuilder. Il faudra un compte développeur Google Play (paiement unique).

## Pas encore fait

Boutique, clans, paiements, mode battle royale en ligne à 8 joueurs.
