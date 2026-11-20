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

## Architecture

- `index.html` : site de présentation + espace de démonstration + fenêtre de connexion.
- `style-v5.css` : styles actifs de la nouvelle identité.
- `app-v3.js` : logique active du planning, du suivi et des analyses.
- `config.js` : configuration publique Supabase (vide par défaut).
- `supabase/schema.sql` : schéma des données par utilisateur et politiques RLS.
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
