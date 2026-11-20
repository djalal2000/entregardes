# PEMESA — prototype web de suivi de la pénibilité au travail

Interface web responsive de démonstration adaptée au projet de recherche PEMESA. Elle présente trois dimensions : **pénibilité ambiante**, **pénibilité de la tâche** et **pénibilité subjective**, en cohérence avec le projet de recherche relatif aux métiers de la santé.

## Adresse publique

- Domaine actuellement utilisé : **https://shiftcare.me**
- Le nom de l'application est **PEMESA** ; le nom de domaine reste **shiftcare.me** tant qu'un autre nom de domaine n'est pas acheté et configuré.
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

## Activer l'authentification par comptes (facultatif)

La connexion réelle reste inactive tant que Supabase n'est pas configuré.

1. Créer un projet sur https://supabase.com.
2. Exécuter `supabase/schema.sql` dans le SQL Editor du projet.
3. Activer l'authentification e-mail et configurer le processus de confirmation.
4. Dans **Authentication > URL Configuration**, utiliser votre URL de site en tant que **Site URL** et renseigner les URL de redirection.
5. Renseigner dans `config.js` les **clés publiques uniquement** :

```js
window.ENTREGARDES_CONFIG = {
  supabaseUrl: "https://votre-projet.supabase.co",
  supabaseAnonKey: "CLE_PUBLIQUE_PUBLISHABLE_OU_ANON"
};
```

Ne jamais inclure de clé `service_role` ou secrète dans un fichier web public. Les politiques `Row Level Security` du SQL restreignent l'accès aux données de l'utilisateur connecté. Une revue de sécurité / conformité RGPD est indispensable avant toute collecte réelle de données physiologiques.

## Architecture

- `index.html` : site de présentation + espace de démonstration + fenêtre de connexion.
- `style-v3.css` : styles actifs de la nouvelle identité.
- `app-v3.js` : logique active du planning, du suivi et des analyses.
- `config.js` : configuration publique Supabase (vide par défaut).
- `supabase/schema.sql` : schéma des données par utilisateur et politiques RLS.
- `CNAME` : domaine actuel `shiftcare.me`.

Les anciens fichiers `app.js`, `app-v2.js`, `style.css` et `style-v2.css` sont conservés pour historique, mais ne sont pas chargés par le site.
