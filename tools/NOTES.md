# Fabrication du fichier unique (index.html)

`index.html` à la racine est généré à partir de `src/` : le code est compilé avec esbuild,
le style est intégré, et la bibliothèque Supabase est chargée par une balise <script> (CDN).

Principe de la commande (voir assemble.mjs) :

    esbuild src/main.tsx --bundle --minify --format=iife --target=es2020 --jsx=automatic \
      --alias:@supabase/supabase-js=./tools/supabase-shim.ts \
      --define:import.meta.env.VITE_SUPABASE_URL="\"<url>\"" \
      --define:import.meta.env.VITE_SUPABASE_ANON_KEY="\"<clé anon publique>\"" \
      --define:import.meta.env.PROD=false --outdir=out
    node tools/assemble.mjs <dossier contenant out/>

`tools/test/` contient une fausse base Supabase et des tests Playwright.
La clé « anon » est publique par conception ; ne jamais mettre la clé « service_role ».
