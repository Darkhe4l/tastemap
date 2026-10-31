// Petites fonctions utilisées par plusieurs composants.

/**
 * Distance lisible : "250 m" ou "1,2 km".
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
	return meters < 1000
		? `${Math.round(meters / 10) * 10} m`
		: `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/**
 * Construit l'URL de la page : pageHref('Soho', 3) → "?q=Soho&id=3", pageHref('Soho') → "?q=Soho".
 * Sert pour ouvrir une fiche et pour le bouton retour.
 * @param {string} query
 * @param {number | null} [id]
 * @returns {string}
 */
export function pageHref(query, id = null) {
	const params = new URLSearchParams();
	if (query) params.set('q', query);
	if (id != null) params.set('id', String(id));
	const qs = params.toString();
	return qs ? `?${qs}` : '/';
}
