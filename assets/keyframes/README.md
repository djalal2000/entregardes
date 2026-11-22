# PEMESA — 5 images clés du nouveau film de l'accueil

Place ici les cinq fichiers source, au format WebP et avec **ces noms exacts** :

- `keyframe_01.webp` : portrait aux yeux ouverts
- `keyframe_02.webp` : transformation du visage en maillage
- `keyframe_03.webp` : visage en trois-quarts et câbles
- `keyframe_04.webp` : faisceau de câbles reliant le visage à l’anneau
- `keyframe_05.webp` : anneau lumineux final

La workflow GitHub Actions `build-cinematic-v2.yml` démarre lorsqu'ils sont ajoutés à `main` et crée automatiquement **120 WebP dans `frames-v2/`**. Les images sont déjà rassemblées dans l’archive `pemesa-cinq-images-cles.zip` fournie dans la conversation.

C’est une interpolation 2,5D basée sur des images de synthèse ; aucune maquette 3D réelle du visage n’est créée. L’accueil, les comptes et la gestion des montres Samsung restent séparés.
