// Requêtes SQL sur les restaurants : recherche dans un rayon et fiche détail.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDb } from './db.js';

/**
 * Les photos de la base ne sont pas fournies : on renvoie null si le fichier n'existe pas
 * dans static/, et la page affiche une tuile colorée à la place.
 * @param {unknown} url
 * @returns {string | null}
 */
function photoUrl(url) {
	if (typeof url !== 'string' || !url.startsWith('/')) return null;
	// /media/x.jpg correspond au fichier static/media/x.jpg
	return existsSync(resolve('static' + url)) ? url : null;
}

/** Rayon de la Terre en mètres. */
const EARTH_RADIUS_M = 6_371_000;

/**
 * Distance en mètres entre deux points GPS (formule de haversine, qui tient compte
 * de la forme ronde de la Terre).
 * @param {number} lat1 @param {number} lng1 @param {number} lat2 @param {number} lng2
 * @returns {number}
 */
function distanceMeters(lat1, lng1, lat2, lng2) {
	// Math.sin et Math.cos attendent des radians
	const toRad = (/** @type {number} */ deg) => (deg * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/**
 * Un restaurant de la liste de résultats.
 * @typedef {object} NearbyRestaurant
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string | null} tagline
 * @property {string} neighborhood
 * @property {number} price_tier
 * @property {number} rating_avg
 * @property {number} latitude
 * @property {number} longitude
 * @property {string | null} cover_url
 * @property {number} distance  en mètres depuis l'adresse recherchée
 */

/**
 * Restaurants à moins de `radius` mètres d'un point, du plus proche au plus éloigné.
 * @param {number} lat @param {number} lng @param {number} [radius]
 * @returns {NearbyRestaurant[]}
 */
export function findNearby(lat, lng, radius = 1000) {
	// SQLite ne sait pas calculer une distance GPS. On procède donc en 2 étapes :
	// 1. en SQL, on prend les restaurants dans un carré de 2 km de côté autour du point ;
	// 2. en JS, on calcule la vraie distance et on garde ceux à moins de 1 km.
	// Pour le carré, on convertit le rayon en degrés (1° de latitude ≈ 111 km ;
	// 1° de longitude est plus court loin de l'équateur, d'où le cosinus).
	const dLat = radius / 111_320;
	const dLng = radius / (111_320 * Math.cos((lat * Math.PI) / 180));

	// Étape 1. Les "?" sont remplis par .all() (requête préparée, contre l'injection SQL).
	// La sous-requête prend la 1re photo pour la miniature.
	const rows = getDb()
		.prepare(
			`SELECT r.id, r.slug, r.name, r.tagline, r.neighborhood, r.price_tier, r.rating_avg,
			        r.latitude, r.longitude,
			        (SELECT p.url FROM photos p WHERE p.restaurant_id = r.id ORDER BY p.position LIMIT 1) AS cover_url
			   FROM restaurants r
			  WHERE r.listing_status = 'published'
			    AND r.latitude  BETWEEN ? AND ?
			    AND r.longitude BETWEEN ? AND ?`
		)
		.all(lat - dLat, lat + dLat, lng - dLng, lng + dLng);

	// Étape 2 : distance exacte, filtre sur le rayon, tri par distance.
	return /** @type {NearbyRestaurant[]} */ (
		rows
			.map((row) => ({
				...row,
				cover_url: photoUrl(row.cover_url),
				distance: Math.round(distanceMeters(lat, lng, Number(row.latitude), Number(row.longitude)))
			}))
			.filter((r) => r.distance <= radius)
			.sort((a, b) => a.distance - b.distance)
	);
}

/**
 * Fiche complète d'un restaurant (infos + tags + photos), ou null s'il n'existe pas.
 * @param {number} id
 */
export function getRestaurant(id) {
	const db = getDb();

	// Infos du restaurant
	const restaurant = db
		.prepare(
			`SELECT id, slug, name, tagline, description, price_tier, rating_avg, rating_count,
			        phone, street_address, postcode, neighborhood, city, latitude, longitude
			   FROM restaurants
			  WHERE id = ? AND listing_status = 'published'`
		)
		.get(id);
	if (!restaurant) return null;

	// Tags ("Basque", "Open Fire"...), via la table de liaison restaurant_tags
	const tags = db
		.prepare(
			`SELECT t.name FROM restaurant_tags rt JOIN tags t ON t.id = rt.tag_id
			  WHERE rt.restaurant_id = ? ORDER BY rt.position`
		)
		.all(id)
		.map((t) => String(t.name));

	// Photos dans l'ordre (la 1re est la grande photo de la fiche)
	const photos = db
		.prepare(`SELECT url, caption, alt_text FROM photos WHERE restaurant_id = ? ORDER BY position`)
		.all(id)
		.map((p) => ({ ...p, url: photoUrl(p.url) }));

	return {
		.../** @type {{ id: number, slug: string, name: string, tagline: string | null, description: string | null, price_tier: number, rating_avg: number, rating_count: number, phone: string | null, street_address: string, postcode: string | null, neighborhood: string, city: string, latitude: number, longitude: number }} */ (
			restaurant
		),
		tags,
		photos:
			/** @type {Array<{ url: string | null, caption: string | null, alt_text: string | null }>} */ (
				photos
			)
	};
}
