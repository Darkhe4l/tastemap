# Tastemap

Recherche de restaurants sur une carte interactive (SvelteKit 3 + Svelte 5 + Leaflet + SQLite).

- **Recherche** : on tape une adresse, l'app affiche tous les restaurants dans un rayon de 1 km, du plus proche au plus éloigné.
- **Fiche détail** : un clic sur un restaurant (dans la liste ou sur la carte) affiche sa fiche à la place de la liste, avec un bouton « Retour à la liste ».

## Lancer le projet

Node.js ≥ 22.13 est requis (le module `node:sqlite` intégré est utilisé, aucune dépendance native).

```sh
npm install
npm run dev
```

## Organisation

| Fichier                                      | Rôle                                                               |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `src/tastemap.db`                            | Base SQLite fournie (chemin modifiable via `DATABASE_PATH`)        |
| `src/lib/server/geocode.js`                  | Adresse → coordonnées via Nominatim (OpenStreetMap, gratuit)       |
| `src/lib/server/restaurants.js`              | Recherche dans le rayon (carré englobant SQL + haversine) et fiche |
| `src/routes/+page.server.js`                 | `load` : lit `?q=<adresse>&id=<restaurant>` dans l'URL             |
| `src/routes/+page.svelte`                    | Mise en page : barre de recherche, panneau latéral, carte          |
| `src/lib/components/Map.svelte`              | Carte Leaflet : marqueurs numérotés, cercle de 1 km                |
| `src/lib/components/RestaurantList.svelte`   | Liste triée par distance                                           |
| `src/lib/components/RestaurantDetail.svelte` | Fiche détaillée + bouton retour                                    |

L'état vit dans l'URL : une recherche se partage par lien et le bouton « précédent » du navigateur fonctionne.

## Photos

La base référence des photos `/media/restaurants/<slug>/0N.jpg` qui ne sont pas fournies.
Tant qu'elles manquent, une tuile colorée s'affiche. Pour les ajouter, déposer les images dans
`static/media/restaurants/<slug>/01.jpg`, `02.jpg`, `03.jpg`.
