# PEMESA — prototype web de suivi de la pénibilité au travail

Interface web responsive de démonstration adaptée au projet de recherche PEMESA. Elle présente trois dimensions : **pénibilité ambiante**, **pénibilité de la tâche** et **pénibilité subjective**, en cohérence avec le projet de recherche relatif aux métiers de la santé.

## Adresse publique

- Domaine actuellement utilisé : **https://pemesa.shiftcare.me**
- Le nom de l'application est **PEMESA** ; le sous-domaine **pemesa.shiftcare.me** est utilisé sur le domaine **shiftcare.me** déjà détenu.
- Le fichier `CNAME` ne doit pas être modifié sans avoir le contrôle du nouveau domaine.

## Fonctionnalités effectivement disponibles

- Page de présentation avec identité visuelle PEMESA et aperçu graphique **fictif, à visée illustrative**.
- Mode démo : vue d'ensemble, planning des postes (jour/nuit/repos), saisie manuelle des mesures et analyses comparatives par type de poste sur 30 jours.
- Saisie : sommeil, sieste, fatigue, pas, activité, fréquence cardiaque, température, humidité, niveau sonore et pénibilité perçue.
- En mode démo, les données saisies restent uniquement dans le navigateur via la clé historique `entregardes.demo.journal.v2` (conservée pour ne pas perdre les entrées précédentes).
- Si Supabase est configuré, connexion/inscription par e-mail et stockage privé par compte avec des politiques RLS.

## Fonctionnalités envisagées, non intégrées à ce prototype

- Connexion automatique de capteurs IoT et de montres connectées.
- Collecte temps réel des signaux physiologiques / environnementaux.
- Reconnaissance automatique de gestes métiers, analyse IA et modèles de recherche.
- Questionnaires scientifiques complets, gestion institutionnelle de campagnes de recherche.

**Important :** n'utilisez pas cette démonstration pour collecter de véritables données de santé sans cadre juridique et technique adapté. Le mode démo conserve les données dans le stockage local et n'assure ni confidentialité sur un terminal partagé ni synchronisation. PEMESA n'est pas un dispositif médical.

## Authentification et stockage Supabase

Le site PEMESA est configuré pour communiquer avec le projet Supabase via sa **Project URL** et une **publishable key publique** dans `config.js`. Il n'est pas nécessaire de connecter l'intégration GitHub dans le tableau de bord Supabase pour que les comptes fonctionnent depuis GitHub Pages.

Pour terminer l'activation côté Supabase :

1. Dans **SQL Editor**, exécuter `supabase/schema.sql` une seule fois (ou adapter les policies existantes avant toute réexécution). La table `journal_entries` doit avoir **RLS activé** avec les politiques utilisateur fournies.
2. Dans **Authentication → URL Configuration**, renseigner la **Site URL** `https://pemesa.shiftcare.me/` et autoriser la redirection `https://pemesa.shiftcare.me/**`.
3. Dans **Authentication → Sign In / Providers**, activer **Email**, autoriser les inscriptions et garder la confirmation des e-mails activée.
4. Pour les **tests**, vérifier les limites de l'envoi d'e-mails par défaut (parfois restreint aux adresses autorisées). Pour inviter de véritables utilisateurs, configurer un service **SMTP personnalisé**, vérifier son domaine, puis tester les e-mails de confirmation et de réinitialisation.
5. Tester sur le site avec un **compte de test dédié** et des valeurs fictives ; vérifier qu'un compte ne peut pas lire les observations d'un autre compte.

Le code Supabase client utilise le champ historique `supabaseAnonKey` dans `config.js`, qui accepte la **publishable key**. Ne jamais ajouter de `service_role`, de secret `sb_secret_` ou de mot de passe serveur au dépôt public.

**Attention — données de santé :** cette démonstration n'est pas prête à recueillir des données physiologiques nominatives réelles. Avant une étude avec des participants, faire valider les aspects RGPD et les exigences françaises applicables à l'hébergement de données de santé (HDS si requis), le consentement, la sécurité et la gouvernance des données.

## Page d'accueil cinématique — nouvelle version à partir de cinq images

Seule la **page d’accueil publique** utilise le nouveau moteur Canvas, **GSAP ScrollTrigger** et **Lenis**, sur fond `#dcd0c8` avec trois textes apparaissant à 0 %, 45 % et 80 % du défilement. L'espace privé, l'authentification Supabase, les préférences de langue et le module Samsung Galaxy Watch ne sont pas modifiés.

La séquence v2 est construite à partir de cinq images clés (portrait réaliste, visage maillé, rotation avec fibres, câbles vers l’anneau, anneau final). Le moteur de rendu produit **120 images WebP** en 1280×720 avec un mouvement de caméra simulé et des transitions progressives. Il s'agit d'une animation **2,5D pilotée au scroll**, pas d'un véritable modèle 3D manipulable du visage.

- `home-scroll.js` : lit **exclusivement** `frames-v2/frame_0001.webp` à `frames-v2/frame_0120.webp` (ancienne séquence de captures désactivée) ; écran de chargement et solution de secours si les nouveaux fichiers sont absents.
- `home-scroll.css` : styles de la page d’accueil uniquement.
- `scripts/build_cinematic_v2.py` : génération des 120 WebP à partir des 5 fichiers `assets/keyframes/keyframe_01.webp` à `keyframe_05.webp`.
- `.github/workflows/build-cinematic-v2.yml` : détecte l'arrivée des cinq images clés et publie automatiquement les 120 images générées dans `frames-v2/`.

**État de publication :** le code de l'accueil et son workflow sont installés, mais les cinq images clés générées dans la conversation doivent encore être **ajoutées au dépôt GitHub**. Elles sont fournies dans l'archive `pemesa-cinq-images-cles.zip`. Le lecteur n'affiche pas les anciennes images de qualité insatisfaisante en attendant la publication. La séquence complète de 120 WebP est également disponible dans l'archive `pemesa-nouvelle-animation-120-webp.zip`.

La syntaxe du JavaScript et la production locale des 120 images ont été vérifiées. Le rendu sur le site publié doit être validé après la présence effective des fichiers sur GitHub.

## Contrôle des montres Samsung Galaxy Watch

La nouvelle rubrique **Montres connectées** dans l'espace personnel permet de :

- créer un code d'association temporaire à 6 chiffres, valable 10 minutes ;
- voir les montres déclarées depuis l'application mobile et leur état réel en ligne/hors ligne ;
- consulter la batterie, le dernier contact et le compteur de transferts déclarés ;
- autoriser ou révoquer les catégories de capteurs (fréquence cardiaque, pas, activité et sommeil) ;
- envoyer les demandes **Démarrer, Pause, Arrêter** et consulter leur confirmation ou leur échec ;
- dissocier l'appareil du compte.

Les accès sont sécurisés par Supabase Auth et RLS. Les tables et la fonction d'association sont décrites dans `supabase/wearables.sql`. L'intégration Android/Wear OS est décrite dans `docs/galaxy-watch-integration.md`.

**Limite importante :** les commandes sont enregistrées et diffusées, mais l'application mobile et l'application de la montre doivent encore implémenter leur réception, l'acquisition de données et les accusés d'exécution. Le dépôt web ne contient pas ces applications natives. Ce module n'enregistre aucune mesure physiologique brute et ne doit pas être confondu avec une collecte médicale opérationnelle.

## Architecture

- `index.html` : site de présentation + espace de démonstration + fenêtre de connexion.
- `style-v5.css` : styles actifs de la nouvelle identité.
- `app-v3.js` : logique active du planning, du suivi et des analyses.
- `config.js` : configuration publique Supabase (vide par défaut).
- `supabase/schema.sql` : schéma des données par utilisateur et politiques RLS.
- `supabase/wearables.sql` : tables et RPC des montres (appliqué sur le projet Supabase existant).
- `wearables.js` / `wearables.css` : interface Samsung Galaxy Watch et commandes de collecte.
- `docs/galaxy-watch-integration.md` : contrat d’intégration des applications Android/Wear OS.
- `CNAME` : sous-domaine officiel actuel `pemesa.shiftcare.me`.

Les anciens fichiers `app.js`, `app-v2.js`, `style.css` et `style-v2.css` sont conservés pour historique, mais ne sont pas chargés par le site.


## Référencement Google (SEO) — requête « PEMESA »

Le site fournit des balises meta adaptées, un lien `canonical`, des données structurées `WebSite`, `robots.txt` et `sitemap.xml` pour faciliter la découverte de l'accueil par les moteurs de recherche.

**La publication du code ne suffit pas à faire apparaître automatiquement PEMESA dans les résultats Google.** Le domaine `pemesa.shiftcare.me` doit d'abord être fonctionnel (DNS Namecheap : CNAME `pemesa` vers `djalal2000.github.io`, contrôle HTTPS GitHub Pages).

Pour demander l'indexation :
1. Ouvrir https://search.google.com/search-console/welcome avec son compte Google.
2. Ajouter la propriété de type **Préfixe d'URL** `https://pemesa.shiftcare.me/`.
3. Vérifier que vous êtes propriétaire du site selon la méthode proposée (balise HTML à insérer dans `index.html`, fichier HTML à déposer à la racine du dépôt, ou vérification DNS via Namecheap).
4. Dans **Inspection de l'URL**, inspecter `https://pemesa.shiftcare.me/` puis demander l'indexation si l'URL est accessible.
5. Dans **Sitemaps**, soumettre `sitemap.xml`.
6. Surveiller la rubrique **Indexation des pages** et rechercher `site:pemesa.shiftcare.me` sur Google pour vérifier la présence éventuelle du site.

Google décide seul du moment et du classement de l'indexation ; aucune position sur le mot-clé « pemesa » n'est garantie. Ne modifiez pas `CNAME` pour cette démarche.

## Identité visuelle

Le fichier `assets/pemesa-logo-transparent.png` est une version optimisée pour le web du logo PEMESA à fond transparent transmis par le propriétaire. Il est utilisé sur la page d’accueil, la navigation, le prototype, la page de profil et comme favicon. Le dessin et l'inscription du logo fourni sont conservés. Le fichier antérieur `assets/pemesa-logo.webp` est conservé pour l’historique, mais n’est plus référencé par les pages HTML actives.


## E-mails d'authentification aux couleurs de PEMESA

Les modèles HTML suivants sont fournis dans le dépôt :

- `supabase/email-templates/confirm-signup.html` — confirmation de l'adresse e-mail ;
- `supabase/email-templates/reset-password.html` — réinitialisation du mot de passe.

Ils conservent la variable **`{{ .ConfirmationURL }}`** imposée par Supabase, utilisent le logo public PEMESA et affichent des messages **en anglais**. Ces fichiers sont des **modèles à copier dans le tableau de bord Supabase** : leur présence sur GitHub ne change pas automatiquement les courriels envoyés.

**Pour que l'expéditeur ne soit plus `Supabase Auth <noreply@mail.app.supabase.io>` :**

1. Choisir un service SMTP externe (ex. Resend), y enregistrer le domaine déjà possédé `shiftcare.me` et le **vérifier**.
2. Chez Namecheap, ajouter uniquement les enregistrements DNS (SPF/DKIM et éventuels autres) *exacts* fournis par ce prestataire. Ne pas supprimer les enregistrements GitHub Pages déjà en place.
3. Dans Supabase **Authentication → Emails → SMTP Settings** (l'intitulé peut changer), activer le SMTP personnalisé. Renseigner le serveur, port, utilisateur et mot de passe SMTP fournis par le prestataire. Définir le nom **PEMESA** et l'expéditeur `no-reply@shiftcare.me`.
4. Dans **Authentication → Emails → Templates**, ouvrir **Confirm signup**, mettre pour objet **PEMESA — Confirm your email address**, puis copier le HTML de `confirm-signup.html`.
5. Optionnel : pour **Reset password**, mettre pour objet **PEMESA — Reset your password**, puis copier `reset-password.html`. **Tester et finir le flux de récupération côté application avant d'utiliser cette fonction en production.**
6. Dans **Authentication → URL Configuration**, vérifier `https://pemesa.shiftcare.me/`, puis envoyer un **e-mail de test**. Vérifier réception, expéditeur, lien, destinataire, SPF/DKIM et antispam.

**Confidentialité :** les identifiants SMTP et clés API du prestataire sont **secrets**. Ils doivent être saisis dans les paramètres privés de Supabase, jamais dans `config.js`, le code du site, GitHub ou une conversation. Les nouveaux utilisateurs reçoivent toujours le courriel standard tant que le SMTP personnalisé et les modèles ne sont pas configurés.

Pour de vrais utilisateurs, prévoir un domaine d'envoi authentifié et une politique de confidentialité adaptée. Ne jamais envoyer de données médicales dans les e-mails d'authentification.

## Interface multilingue : français, anglais, arabe

Une option de langue est disponible dans l’en-tête de la page d’accueil, dans l’espace personnel, dans la fenêtre de connexion et sur la page auteur :

- **Français** (`fr`, langue par défaut).
- **English** (`en`).
- **العربية** (`ar`, mise en page de droite à gauche, `dir="rtl"`).

La préférence est enregistrée localement dans le navigateur (`localStorage`, clé `pemesa.language`). Le titre de page, les textes de l’interface, les principaux messages de connexion et les dates du tableau de bord s’adaptent au choix. La logique des comptes Supabase, les données sauvegardées et le domaine ne sont pas modifiés. Les traductions sont dans `i18n.js` ; les ajustements de mise en page dans `language.css`.

**Limite :** le sélecteur traduit l'interface web, **pas** automatiquement les e-mails d’authentification Supabase. Les modèles d’e-mails gérés dans Supabase conservent leur langue configurée tant qu’aucune logique d’envoi multilingue n’est mise en place. Vérifier le rendu sur mobile et les champs de données saisis manuellement avant une mise en production destinée à des participants.


## Animations et accessibilité

La page d’accueil PEMESA utilise des animations légères :
- apparition progressive du titre, du logo et de l’aperçu du tableau de bord ;
- révélation des sections au défilement (IntersectionObserver) ;
- effets de survol discrets sur les boutons, les cartes et les éléments du tableau de bord ;
- apparition de la fenêtre d’authentification et tracé des graphiques de démonstration.

Les styles sont séparés dans `animations.css` et le déclenchement des apparitions dans `animations.js`. `app-v3.js` prévient le gestionnaire des animations quand les vues du tableau de bord sont reconstruites. Ces animations respectent `prefers-reduced-motion: reduce`, et le contenu reste visible si JavaScript ou IntersectionObserver n'est pas disponible. Aucun service tiers n’est nécessaire pour les animations ; les comptes Supabase, les données utilisateurs et la navigation FR/EN/AR ne sont pas modifiés.


## Identité visuelle : accents orange

La nouvelle finition dans `modern-theme.css` conserve le bleu marine, le bleu clair et le logo officiel PEMESA, en ajoutant **une touche d'orange** (`#e97637`) sur le badge de recherche, les séparateurs, une carte de fonctionnalités, certaines icônes, les états actifs, le formulaire et la navigation du tableau de bord. L'en-tête est plus léger, les cartes plus aérées et les surfaces plus modernes.

La feuille est chargée **après** `style-v5.css`, `language.css` et `animations.css` pour éviter de modifier le style historique et conserver les fonctionnalités existantes (français, anglais, arabe RTL, animations, GitHub Pages et connexion Supabase). Les contrastes forts restent en bleu marine ; les petites touches orange utilisent une nuance foncée pour le texte. Sur mobile, l'en-tête n'est pas fixé afin de préserver l'espace visible.
