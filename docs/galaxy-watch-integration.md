
# PEMESA — Connecter une Samsung Galaxy Watch (Android / Wear OS)

## État réel de l'intégration

Le tableau de bord web, les tables Supabase privées, l'association par code et les commandes sont installés. **Aucun navigateur ne peut activer directement les capteurs de la Galaxy Watch.** L'application Android PEMESA et l'application Wear OS existantes doivent être reliées à cette interface ; leur code natif n'est pas présent dans ce dépôt web.

Le module stocke seulement les **métadonnées** (association, état, batterie, compteur de mesures, opt-in et commandes). Il ne conserve **aucune donnée physiologique brute**.

## Architecture

    Galaxy Watch (Wear OS + capteurs Samsung / Android)
             │ Wear OS Data Layer ou transport déjà implémenté
             ▼
    Application Android PEMESA (Supabase Auth, compte identique)
             │ HTTPS/PostgREST + JWT de l'utilisateur
             ▼
    Supabase (RLS et Realtime)
       wearable_pairings : code de 6 chiffres valable 10 min
       wearable_devices  : identité technique, consentement, état confirmé
       wearable_commands : start / pause / stop, accusé d'exécution
             ▲
             │ Supabase Realtime et rafraîchissement de secours
             ▼
    Site PEMESA → « Montres connectées »

La Galaxy Watch doit être compatible avec le SDK utilisé. Les Galaxy Watch4 et modèles Samsung Wear OS ultérieurs sont pris en charge par le Samsung Health Sensor SDK selon les caractéristiques de l'appareil, les autorisations et les conditions d'accès. Pour importer des mesures déjà synchronisées avec Samsung Health, examiner Health Connect / Samsung Health Data SDK sur Android ; ce n'est pas un substitut universel à une mesure continue.

Références techniques :
- https://developer.samsung.com/health/sensor/overview.html
- https://developer.samsung.com/health/sensor/guide/getting-started.html
- https://developer.samsung.com/codelab/health/heart-rate-data-transfer.html
- https://developer.samsung.com/health/health-connect-faq.html
- https://supabase.com/docs/guides/realtime/postgres-changes

## 1. Association par code

1. Sur le site, se connecter puis cliquer sur **Montres connectées → Associer une Galaxy Watch**.
2. PEMESA génère un code temporaire de 6 chiffres dans `wearable_pairings`. Il expire après **10 minutes**.
3. Sur le téléphone Android, connecter l'application PEMESA au **même compte Supabase** que le site. L'utilisateur y entre ce code.
4. Le téléphone vérifie que la Galaxy Watch est réellement associée et appelle `public.claim_wearable_pairing` avec son **jeton utilisateur**.
5. La fonction (SECURITY INVOKER) valide code, expiration et propriétaire, puis crée/actualise `wearable_devices` et retourne son `device_id` UUID.
6. L'état **En ligne** est affiché uniquement si l'application a rapporté un contact effectif de la montre dans les 120 dernières secondes.

Appel REST `POST /rest/v1/rpc/claim_wearable_pairing` :

```json
{
  "p_code": "123456",
  "p_installation_id": "15a22ae5-fef1-48a0-bdbe-d6fbc745c9b6",
  "p_display_name": "Samsung Galaxy Watch",
  "p_model": "Galaxy Watch6"
}
```

Le code et l'UUID ci-dessus sont **des exemples**. La vraie valeur `p_installation_id` est un UUID v4 aléatoire propre à l'installation et conservé par l'application Android. Ne pas utiliser le numéro de série réel de la montre.

Headers de chaque requête depuis l'application mobile :
- `apikey: <publishable-key>` — uniquement une clé publique Supabase.
- `Authorization: Bearer <user-access-token>` — JWT Supabase Auth du compte connecté.
- `Content-Type: application/json`.

Ne jamais intégrer de `service_role`, de `sb_secret_` ou de jetons d'administrateur dans les applications mobiles.

## 2. État de connexion réellement confirmé

Lorsqu'elle constate la présence de la Galaxy Watch, l'application Android met à jour une ligne `wearable_devices` appartenant à l'utilisateur :

```json
{
  "last_seen_at": "2026-11-22T21:00:00Z",
  "battery_percent": 76,
  "actual_state": "stopped",
  "updated_at": "2026-11-22T21:00:00Z"
}
```

Filtrer par `id=device_id` et `user_id=auth.uid()` en plus des politiques RLS. Ne **pas** mettre à jour `last_seen_at` si seul le téléphone est en ligne mais que la montre est déconnectée. Le site calcule automatiquement « Hors ligne » après 2 minutes sans contact.

Après un transfert autorisé vers une future chaîne de traitement adaptée, l'app peut également envoyer le nombre **agrégé** `sample_count` et l'horodatage `last_sample_at` ; ces champs ne contiennent pas de données physiologiques brutes.

## 3. Consentement et catégories

Avant d'activer un capteur, lire `wearable_devices` pour obtenir :

- `collection_opt_in` (faux par défaut).
- `requested_metrics` : codes possibles `heart_rate`, `steps`, `activity`, `sleep`.
- `actual_state` : `stopped`, `running`, `paused`.
- `last_seen_at` : dernier contact direct avec la montre.

Ne collecter **aucune donnée** quand `collection_opt_in=false`. Respecter les permissions spécifiques Android/Wear OS, les capacités du modèle et les catégories demandées. La révocation depuis le site doit arrêter la collecte dès qu'elle atteint l'application mobile, même si une commande explicite `stop` n'a pas pu arriver. En cas de dissociation, le connecteur doit s'arrêter de manière sûre.

Cette autorisation technique n'est pas une preuve suffisante de consentement éclairé pour une recherche clinique.

## 4. Commandes envoyées depuis PEMESA

Le site insère une commande dans `wearable_commands` :

```json
{
  "user_id": "<auth.uid()>",
  "device_id": "<uuid-de-la-montre>",
  "action": "start",
  "status": "pending"
}
```

Les trois actions sont `start`, `pause`, `stop`. Sur Android, récupérer les commandes `pending` pour le `device_id`, les traiter **dans l'ordre**, puis demander à l'application Wear OS d'exécuter les opérations capteur. Le connecteur Android doit utiliser les messages d'acquittement de Wear OS pour déterminer si la commande a réellement réussi.

Seulement après confirmation **de la montre** :

```json
{
  "status": "applied",
  "acknowledged_at": "2026-11-22T21:00:10Z"
}
```

En cas d'échec :

```json
{
  "status": "failed",
  "acknowledged_at": "2026-11-22T21:00:10Z",
  "error_message": "Permission capteur refusée sur la montre."
}
```

Actualiser `wearable_devices.actual_state` d'après le résultat réellement constaté. Ne jamais marquer `applied` simplement parce que la requête REST a réussi. L'écran affiche la distinction entre **commande envoyée**, **commande confirmée** et **échec**.

Les commandes doivent être idempotentes. Une demande `start` ne doit pas contourner `collection_opt_in` ni les permissions du téléphone ou de la montre. Une demande `stop` doit libérer les capteurs avant son acquittement. Une montre déconnectée ne peut pas être arrêtée instantanément à distance ; prévoir dans l'app un arrêt local sûr et une politique explicite de déconnexion.

## 5. Sécurité et conformité

- Les 3 tables ont RLS par `auth.uid() = user_id` sur lecture, insertion, modification et suppression. Aucun accès `anon`.
- Les clés étrangères utilisateur/appareil évitent d'associer une commande à un appareil appartenant à un autre compte.
- `claim_wearable_pairing` est un RPC `SECURITY INVOKER`, exécuté sous les droits de l'utilisateur connecté.
- Ne pas envoyer de mesures physiologiques nominatives vers `wearable_devices`, `journal_entries` ni d'autres tables non prévues pour des données de santé. Vérifier les exigences RGPD, consentement, durée de rétention et HDS si applicable avant un véritable protocole de recherche.
- Utiliser HTTPS, stocker les tokens d'authentification Android de manière sécurisée, et ne jamais exposer des secrets serveur dans une application.
- Vérifier les restrictions Android liées aux capteurs corporels, services de premier plan et consommation de batterie.

## 6. Recette sur matériel réel

1. Associer une vraie Galaxy Watch à un téléphone Android compatible.
2. Tester codes valides, incorrects et expirés ; vérifier le cloisonnement entre deux comptes.
3. Vérifier la déconnexion lorsque la montre ne donne plus de signe de vie pendant 2 minutes.
4. Enregistrer l'opt-in et les capteurs autorisés ; tester `start`, `pause`, `stop` et les accusés de la montre.
5. Révoquer l'autorisation et vérifier l'arrêt effectif, y compris après reconnexion.
6. Tester la dissociation, le refus de permission et une panne réseau.
7. Vérifier que les données brutes de santé ne sont pas stockées par ce module.

**Livré dans ce dépôt :** interface web + base de contrôle sécurisée + protocole documenté.

**À raccorder pour une vraie collecte :** code natif existant de l'application Android PEMESA et de l'application Galaxy Watch, puis tests sur appareil physique.
