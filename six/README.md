# SIX

L'app perso de Timéo pour ses six objectifs : front lever, guitare (Freakin' Out), chanson par cœur, italien (200 mots), jiu-jitsu brésilien, tourniquet.

- `public/` : l'app (PWA, vanilla JS, aucune dépendance côté client)
- `netlify/functions/state.mts` : synchronisation de la progression (Netlify Blobs, un document par code de synchro)
- Déploiement : projet Netlify avec **base directory = `six`** (le `netlify.toml` fait le reste)

Les vidéos filmées dans l'app restent sur l'appareil (IndexedDB). La progression (XP, paliers, séries, mots) est synchronisée via `/api/state`.
