# Space Brawl : publier sur le Google Play Store (guide depuis un téléphone)

## Textes de la fiche (à copier-coller)

**Nom (30 caractères max)** : Space Brawl

**Description courte (80 caractères max)** : Combats dans l'espace : collectionne des pilotes et des soucoupes !

**Description complète** :
Space Brawl est un jeu d'action spatial en vue de dessus, aux couleurs vives.

• 8 chapitres, des dizaines de niveaux et de méga boss
• Battle Royale à 8 pilotes : une zone qui se rétrécit, le dernier en vie gagne
• Plus de 14 pilotes et 14 soucoupes à collectionner, du commun au légendaire
• Des skins, des packs duo et des méga coffres
• Missions du jour, cadeau quotidien, trophées, classement et route des récompenses
• Rejoins ou crée un clan et discute avec ses membres
• Aucune publicité

**Catégorie** : Jeux > Action
**Public** : 13 ans et plus
**Politique de confidentialité** : https://raph-f-raph.github.io/space-brawl/privacy.html
**Suppression du compte** : dans le jeu, Réglages puis « Supprimer mon compte » (même page web pour la fiche)

## Images (déjà prêtes, envoyées dans la conversation)
- Icône 512×512 : `icon-512.png` dans le dépôt
- Image de présentation 1024×500 : `feature-graphic-1024x500.png`
- Captures d'écran : `1-accueil.png` à `6-niveau.png` (paysage)

## Étapes
1. **Compte développeur** : play.google.com/console, frais uniques de 25 $. Vérification d'identité demandée.
   Important : un compte personnel récent doit faire un **test fermé avec au moins 12 testeurs pendant 14 jours** avant de pouvoir publier pour tout le monde. Il faut donc recruter 12 amis (Gmail) tôt.
2. **Créer le paquet Android** : sur pwabuilder.com, entre https://raph-f-raph.github.io/space-brawl/ puis choisis « Package for stores » puis **Android**. Garde bien le fichier de clé (`signing.keystore` + mots de passe) : sans lui, impossible de mettre à jour l'appli.
3. **Barre d'adresse** : pour qu'elle disparaisse dans l'appli, il faut héberger un fichier `assetlinks.json` à la racine d'un site (`https://raph-f-raph.github.io/.well-known/assetlinks.json`), ce qui demande un dépôt GitHub nommé `raph-f-raph.github.io`. À faire avec Claude au moment venu.
4. **Dans la Play Console** : créer l'appli, importer le `.aab`, remplir la fiche (textes + images), le questionnaire de classification, la déclaration de sécurité des données (e-mail, pseudo, progression) et la politique de confidentialité.
5. **Test fermé** : ajouter 12 testeurs, attendre 14 jours, puis demander l'accès à la production.
6. **Achats réels** : à ajouter après la première publication (Google Play Billing).

## À compléter avant l'envoi
- Adresse e-mail de contact dans `privacy.html` (actuellement un emplacement à remplir).
