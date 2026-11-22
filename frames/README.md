# Images de la page d'accueil PEMESA

Déposez ici exactement **120 fichiers WebP**, en respectant les noms :

- `frame_0001.webp` (première image)
- `frame_0002.webp`
- …
- `frame_0120.webp` (dernière image)

L'animation de la page d'accueil utilise `home-scroll.js`, le Canvas 2D et le défilement GSAP/ScrollTrigger + Lenis.

**Les images ne sont pas fournies dans le dépôt à cette étape.** En attendant, le site présente un visuel de secours beige/rosé, avec les trois textes au scroll. Le vrai rendu cinématique est activé automatiquement lorsque `frame_0001.webp` est disponible ; les 119 suivantes sont alors chargées avec une progression en pourcentage. Les images manquantes sont remplacées temporairement par la plus proche disponible.

Recommandations : toutes les images au même format et au même ratio (par exemple 1920×1080 en 16:9), compressées en WebP pour limiter le temps de chargement. Le Canvas applique un cadrage `cover`.

**Ne pas déposer ici de données personnelles ni d'informations de santé identifiables.**
