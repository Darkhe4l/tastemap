<script>
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';

	// Carte Leaflet : l'adresse recherchée, le cercle de 1 km et un marqueur numéroté
	// par restaurant. Un clic sur un marqueur appelle onselect(id) pour ouvrir la fiche.

	/**
	 * @type {{
	 *   origin: { lat: number, lng: number, label: string } | null,
	 *   radius: number,
	 *   restaurants: Array<{ id: number, name: string, latitude: number, longitude: number }>,
	 *   selected: { id: number, name: string, latitude: number, longitude: number } | null,
	 *   onselect: (id: number) => void
	 * }}
	 */
	let { origin, radius, restaurants, selected, onselect } = $props();

	// Centre de Londres, avant la première recherche
	const LONDON = /** @type {[number, number]} */ ([51.515, -0.09]);

	/** @type {HTMLDivElement} */
	let container;
	/** @type {typeof import('leaflet') | undefined} */
	let L = $state();
	// L et map sont en $state pour que les $effect se lancent dès que la carte est prête
	/** @type {import('leaflet').Map | undefined} */
	let map = $state();

	// Création de la carte (et destruction quand le composant disparaît)
	onMount(() => {
		let cancelled = false;
		/** @type {import('leaflet').Map | undefined} */
		let instance;

		// Leaflet a besoin du navigateur : on l'importe seulement ici
		import('leaflet').then((mod) => {
			if (cancelled) return;
			const leaflet = mod.default ?? mod;
			instance = leaflet.map(container, { zoomControl: false }).setView(LONDON, 13);
			// Boutons +/- en bas à droite, comme sur la maquette
			leaflet.control.zoom({ position: 'bottomright' }).addTo(instance);
			// Fond de carte OpenStreetMap (gratuit ; CARTO, celui de la maquette, demande une clé)
			leaflet
				.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 19
				})
				.addTo(instance);
			L = leaflet;
			map = instance;
		});

		return () => {
			cancelled = true;
			instance?.remove();
		};
	});

	// On extrait des nombres pour que les effets ne se relancent que si les coordonnées changent
	const originLat = $derived(origin?.lat);
	const originLng = $derived(origin?.lng);
	const selectedId = $derived(selected?.id ?? null);
	const selectedLat = $derived(selected?.latitude);
	const selectedLng = $derived(selected?.longitude);

	// Chaque effet dessine dans un calque (layerGroup) et l'efface avant de redessiner.

	// 1. Point noir sur l'adresse recherchée + cercle de 1 km
	$effect(() => {
		if (!L || !map || originLat == null || originLng == null) return;
		const layer = L.layerGroup().addTo(map);
		L.circle([originLat, originLng], {
			radius,
			color: '#3e5f3f',
			weight: 1.5,
			opacity: 0.6,
			dashArray: '4 6',
			fillColor: '#3e5f3f',
			fillOpacity: 0.06,
			interactive: false
		}).addTo(layer);
		// divIcon = marqueur en HTML/CSS (style .tm-origin plus bas)
		L.marker([originLat, originLng], {
			icon: L.divIcon({
				className: 'tm-origin',
				html: '<span></span>',
				iconSize: [18, 18],
				iconAnchor: [9, 9]
			}),
			keyboard: false,
			interactive: false,
			zIndexOffset: -100
		}).addTo(layer);
		return () => {
			layer.remove();
		};
	});

	// 2. Un marqueur par restaurant, numéroté comme dans la liste (1 = le plus proche)
	$effect(() => {
		if (!L || !map) return;
		const leaflet = L;
		const layer = leaflet.layerGroup().addTo(map);

		// Si la fiche ouverte n'est pas dans les résultats, on affiche quand même son marqueur
		const places = [...restaurants];
		if (selected && !places.some((p) => p.id === selected.id)) places.push(selected);

		places.forEach((place) => {
			const index = restaurants.findIndex((r) => r.id === place.id);
			// Le marqueur du restaurant ouvert est agrandi
			const active = place.id === selectedId;
			const label = index >= 0 ? String(index + 1) : '•';
			leaflet
				.marker([place.latitude, place.longitude], {
					icon: leaflet.divIcon({
						className: `tm-pin${active ? ' is-active' : ''}`,
						html: `<span class="tm-pin-shape"><span class="tm-pin-label">${label}</span></span>`,
						iconSize: [40, 40],
						// la pointe est à gauche
						iconAnchor: [0, 20]
					}),
					title: place.name,
					alt: place.name,
					riseOnHover: true,
					// Le marqueur ouvert passe devant, puis le n°1 devant le n°2, etc.
					zIndexOffset: active ? 1000 : -index
				})
				.on('click', () => onselect(place.id))
				.addTo(layer);
		});

		return () => {
			layer.remove();
		};
	});

	// 3. Cadrage : zoom sur le restaurant ouvert, sinon on montre tout le cercle
	$effect(() => {
		if (!L || !map) return;
		if (selectedLat != null && selectedLng != null) {
			map.flyTo([selectedLat, selectedLng], Math.max(map.getZoom(), 16), { duration: 0.6 });
		} else if (originLat != null && originLng != null) {
			const bounds = L.latLng(originLat, originLng).toBounds(radius * 2);
			map.flyToBounds(bounds, { padding: [24, 24], duration: 0.6 });
		}
	});
</script>

<div class="map" bind:this={container}></div>

<style>
	.map {
		position: absolute;
		inset: 0;
		background: #f2eee3;
	}

	/* :global car ces éléments sont créés par Leaflet, pas par Svelte */

	/* Teinte chaude façon maquette */
	.map :global(.leaflet-tile-pane) {
		filter: sepia(0.35) saturate(0.55) brightness(1.06) contrast(0.92);
	}

	.map :global(.leaflet-control-attribution) {
		font-size: 10px;
		background: rgb(255 255 255 / 0.7);
	}

	.map :global(.leaflet-bar a) {
		color: var(--ink);
	}

	/* --- Marqueurs restaurant ------------------------------------------- */
	.map :global(.tm-pin) {
		background: none;
		border: none;
	}

	.map :global(.tm-pin-shape) {
		position: absolute;
		top: 6px;
		left: 6px;
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		background: var(--green);
		border: 2px solid #fff;
		/* coin bas-gauche pointu, tourné de 45° → pointe vers la gauche */
		border-radius: 50% 50% 50% 0;
		transform: rotate(45deg);
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
		cursor: pointer;
	}

	.map :global(.tm-pin-label) {
		transform: rotate(-45deg);
		color: #fff;
		font: 600 13px/1 var(--font-sans);
	}

	.map :global(.tm-pin.is-active .tm-pin-shape) {
		transform: rotate(45deg) scale(1.2);
		box-shadow:
			0 0 0 6px rgb(197 138 44 / 0.25),
			0 3px 10px rgb(0 0 0 / 0.3);
	}

	/* --- Adresse recherchée ------------------------------------------- */
	.map :global(.tm-origin span) {
		display: block;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--ink);
		border: 3px solid #fff;
		box-shadow: 0 0 0 0 rgb(31 36 32 / 0.4);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		to {
			box-shadow: 0 0 0 14px rgb(31 36 32 / 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.map :global(.tm-origin span) {
			animation: none;
		}
	}
</style>
