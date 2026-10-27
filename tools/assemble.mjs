import fs from 'node:fs';
const dir = process.argv[2];
const css = fs.readFileSync(`${dir}/out/main.css`, 'utf8');
const js = fs.readFileSync(`${dir}/out/main.js`, 'utf8').replace(/<\/script/gi, '<\\/script');
const icon = fs.readFileSync('/home/claude/space-brawl/public/icon.svg').toString('base64');
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<meta name="theme-color" content="#0b1030" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="manifest" href="manifest.webmanifest" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${icon}" />
<link rel="apple-touch-icon" href="icon-192.png" />
<script>window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__installEvent=e;});if("serviceWorker"in navigator&&location.protocol.indexOf("http")===0){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap" rel="stylesheet" />
<title>Space Brawl</title>
<style>${css}</style>
</head>
<body>
<div id="root"><p id="boot" style="color:#fff;font:16px system-ui;text-align:center;padding:40px 16px">Chargement…</p></div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js" onerror="document.getElementById('boot').textContent='Impossible de charger le jeu. Vérifie ta connexion internet puis recharge la page.'"></script>
<script>${js}</script>
</body>
</html>
`;
fs.writeFileSync(`${dir}/index.html`, html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' Ko');
