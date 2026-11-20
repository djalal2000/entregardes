# EntreGardes

Site responsive inspiré des plateformes SaaS, avec page d'accueil, aperçu illustratif, planning, journal quotidien, tendances et authentification facultative.

## Démarrage

Ouvrez index.html ou publiez le site sur GitHub Pages. La démo est disponible immédiatement. Les données saisies en mode démo restent dans le localStorage du navigateur sous la clé entregardes.demo.journal.v2 : elles ne sont ni synchronisées ni privées sur un appareil partagé.

## Activer les comptes et le stockage personnel

1. Créez un projet sur https://supabase.com.
2. Exécutez supabase/schema.sql dans SQL Editor.
3. Dans Authentication, activez le fournisseur e-mail (et la confirmation des adresses si souhaitée).
4. Dans Authentication > URL Configuration, configurez la Site URL de votre site et les Redirect URLs pour les courriels.
5. Dans config.js, remplacez les valeurs vides par l'URL Supabase et la clé publique publishable (ou anon legacy) :

    window.ENTREGARDES_CONFIG = {
      supabaseUrl: "https://VOTRE-PROJET.supabase.co",
      supabaseAnonKey: "CLE_PUBLIQUE_PUBLISHABLE_OU_ANON"
    };

6. Publiez et testez inscription, confirmation, connexion et réinitialisation.

**Important :** ne mettez jamais de service_role / secret key dans un fichier web public. Les règles Row Level Security du script SQL protègent les entrées des utilisateurs. L'aperçu marketing montre des valeurs fictives. Le tableau de bord connecté montre les valeurs réellement enregistrées par l'utilisateur. Les données démo ne sont pas automatiquement migrées vers un compte.

Avant toute utilisation avec des données physiologiques réelles : effectuer une analyse RGPD appropriée, documenter la conservation, les droits d'accès, l'effacement, la sécurité et l'hébergement. EntreGardes ne fournit pas de conseil médical.

## Structure

- index.html : accueil, fenêtre d'authentification et espace de travail
- style.css : design responsive
- app.js : données, vues, sauvegarde et authentification
- config.js : configuration publique optionnelle
- supabase/schema.sql : table Postgres et règles d'accès
- CNAME : domaine personnalisé conservé
