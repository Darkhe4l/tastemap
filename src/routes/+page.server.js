import { geocode } from '#lib/server/geocode.js';
import { findNearby, getRestaurant } from '#lib/server/restaurants.js';

// Rayon de recherche : 1 km
const RADIUS_M = 1000;

/**
 * On garde la recherche et le restaurant ouvert dans l'URL :
 *   /?q=Redchurch St, London        → liste des restaurants à moins de 1 km
 *   /?q=Redchurch St, London&id=1   → fiche du restaurant 1
 * Comme ça le lien est partageable et le bouton "précédent" du navigateur marche.
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ url }) {
	// S'il n'y a pas de ?q= dans l'url, get() renvoie null, null.trim() causerait une erreur
	// ?? '' met une valeur par défaut a query pour éviter ca
	const query = url.searchParams.get('q')?.trim() ?? '';
	// Pas besoin ici car pas de .trim()
	const id = Number(url.searchParams.get('id'));

	// Fiche détail si un id est dans l'URL
	const selected = Number.isInteger(id) && id > 0 ? getRestaurant(id) : null;

	// Pas encore de recherche : la page affiche des exemples
	if (!query) {
		return { query, radius: RADIUS_M, origin: null, restaurants: [], selected, error: null };
	}

	try {
		// Adresse → coordonnées GPS
		const origin = await geocode(query);

		if (!origin) {
			return {
				query,
				radius: RADIUS_M,
				origin: null,
				restaurants: [],
				selected,
				error: `Adresse « ${query} » introuvable. Essayez avec un nom de rue et une ville.`
			};
		}
		// Restaurants à moins de 1 km, triés par distance
		const restaurants = findNearby(origin.lat, origin.lng, RADIUS_M);
		return { query, radius: RADIUS_M, origin, restaurants, selected, error: null };
	} catch {
		// Nominatim ne répond pas : on affiche un message au lieu de planter
		return {
			query,
			radius: RADIUS_M,
			origin: null,
			restaurants: [],
			selected,
			error: 'Le service de recherche d’adresse est indisponible. Réessayez dans un instant.'
		};
	}
}
