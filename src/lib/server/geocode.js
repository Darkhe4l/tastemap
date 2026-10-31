// Transforme une adresse en coordonnées GPS avec Nominatim (OpenStreetMap)

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * @typedef {{ lat: number, lng: number, label: string }} Place
 */

/**
 * Cache des adresses déjà cherchées : quand on ouvre une fiche, on ne rappelle pas Nominatim.
 * @type {Map<string, Place | null>}
 */
const cache = new Map();

/**
 * @param {string} address
 * @returns {Promise<Place | null>} null si l'adresse est introuvable
 */
export async function geocode(address) {
	const key = address.trim().toLowerCase();
	if (cache.has(key)) return cache.get(key) ?? null;

	const url = new URL(NOMINATIM_URL);
	url.searchParams.set('q', address);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('limit', '1'); // seulement le meilleur résultat

	// Nominatim demande un User-Agent qui identifie l'application
	const res = await fetch(url, {
		headers: {
			'User-Agent': 'Tastemap/0.1 (student project)',
			'Accept-Language': 'fr'
		}
	});
	if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

	// Nominatim renvoie lat/lon en texte, d'où les Number()
	/** @type {Array<{ lat: string, lon: string, display_name: string }>} */
	const results = await res.json();
	const first = results[0];
	const place = first
		? { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name }
		: null;

	cache.set(key, place);
	return place;
}
