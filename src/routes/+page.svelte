<script>
	import { goto } from '$app/navigation';
	import Map from '#lib/components/Map.svelte';
	import RestaurantList from '#lib/components/RestaurantList.svelte';
	import RestaurantDetail from '#lib/components/RestaurantDetail.svelte';
	import { pageHref } from '#lib/format.js';

	// Page principale : barre de recherche, panneau de gauche (liste ou fiche) et carte.
	// Les données arrivent dans `data`, préparées par +page.server.js.

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	// Distance du restaurant ouvert, retrouvée dans les résultats
	const selectedDistance = $derived(
		data.selected
			? (data.restaurants.find((r) => r.id === data.selected?.id)?.distance ?? null)
			: null
	);

	// Exemples proposés avant la première recherche
	const EXAMPLES = [
		'Redchurch St, Shoreditch, London',
		'Borough Market, London',
		'Soho Square, London'
	];

	/**
	 * Clic sur un marqueur de la carte : on ajoute l'id dans l'URL pour ouvrir la fiche.
	 * @param {number} id
	 */
	function select(id) {
		goto(pageHref(data.query, id), { reset: false });
	}
</script>

<svelte:head>
	<!--
		Le titre de l'onglet sera Tastemap si aucun restaurant n'est sélectionné
		sinon il affiche le nom du restaurant actuel suivi de Tastemap
	-->
	<title>{data.selected ? `${data.selected.name} · Tastemap` : 'Tastemap'}</title>
</svelte:head>

<div class="app">
	<!-- Panneau de gauche : la fiche si un restaurant est sélectionné, sinon la liste -->
	<aside class="panel">
		{#if data.selected}
			<RestaurantDetail
				restaurant={data.selected}
				distance={selectedDistance}
				backHref={pageHref(data.query)}
			/>
		{:else}
			<header class="head">
				<a class="logo" href="/">Tastemap.</a>
				<p class="chip">
					<span class="chip-dot" aria-hidden="true"></span>
					Rayon de 1 km{#if data.origin}&nbsp;· {data.restaurants.length}
						{data.restaurants.length <= 1 ? 'adresse' : 'adresses'}{/if}
				</p>
				<h1>{data.origin ? 'Les tables près de vous' : 'Trouver une table'}</h1>
				<p class="lede">
					{#if data.origin}
						Tous les restaurants à moins de 1 km de <strong
							>{data.origin.label.split(',').slice(0, 2).join(',')}</strong
						>, du plus proche au plus éloigné.
					{:else}
						Saisissez une adresse dans la barre de recherche pour voir tous les restaurants à moins
						de 1 km, du plus proche au plus éloigné.
					{/if}
				</p>
			</header>

			<!-- Erreur, pas encore de recherche, aucun résultat, ou la liste -->
			<div class="body">
				{#if data.error}
					<p class="state error">{data.error}</p>
				{:else if !data.origin}
					<div class="state">
						<p>Essayez par exemple :</p>
						<ul class="examples">
							{#each EXAMPLES as example (example)}
								<li><a href={pageHref(example)}>{example}</a></li>
							{/each}
						</ul>
					</div>
				{:else if data.restaurants.length === 0}
					<p class="state">
						Aucun restaurant à moins de 1 km de cette adresse. Essayez une adresse plus proche du
						centre de Londres.
					</p>
				{:else}
					<RestaurantList query={data.query} restaurants={data.restaurants} />
				{/if}
			</div>

			<footer class="foot">
				Cliquez sur un restaurant pour voir ses plats, son adresse et l'itinéraire.
			</footer>
		{/if}
	</aside>

	<!-- Partie droite : la carte, avec la barre de recherche par-dessus -->
	<main class="map-area">
		<Map
			origin={data.origin}
			radius={data.radius}
			restaurants={data.restaurants}
			selected={data.selected}
			onselect={select}
		/>

		<!-- Formulaire GET : envoyer la recherche mène à /?q=<adresse> -->
		<form class="search" method="GET" action="/" role="search">
			<svg class="search-icon" viewBox="0 0 16 16" aria-hidden="true">
				<circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
				<path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<label class="visually-hidden" for="q">Adresse</label>
			<input
				id="q"
				name="q"
				type="search"
				placeholder="Redchurch St, Shoreditch, London"
				value={data.query}
				autocomplete="street-address"
				required
			/>
			<span class="radius">rayon<br />1 km</span>
			<button class="go" type="submit" aria-label="Rechercher">
				<svg viewBox="0 0 16 16" aria-hidden="true"
					><path
						d="M3 8h10m-4-4 4 4-4 4"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
					/></svg
				>
			</button>
		</form>
	</main>
</div>

<style>
	.app {
		display: grid;
		grid-template-columns: 340px 1fr;
		height: 100dvh;
	}

	/* --- Panneau latéral ---------------------------------------------- */
	.panel {
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: var(--cream);
		border-right: 1px solid var(--line);
		z-index: 1;
	}

	.head {
		padding: 18px 20px 12px;
	}

	.logo {
		display: inline-block;
		font-family: var(--font-serif);
		font-size: 20px;
		font-weight: 700;
		text-decoration: none;
	}

	.chip {
		display: flex;
		width: fit-content;
		align-items: center;
		gap: 6px;
		margin: 14px 0 0;
		padding: 3px 10px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: #fff;
		font-size: 11px;
		color: var(--muted);
	}

	.chip-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--green);
	}

	h1 {
		margin: 12px 0 6px;
		font-family: var(--font-serif);
		font-size: 26px;
		font-weight: 700;
		line-height: 1.15;
	}

	.lede {
		margin: 0;
		font-size: 12.5px;
		color: var(--muted);
	}

	.lede strong {
		color: var(--ink);
		font-weight: 600;
	}

	.body {
		flex: 1;
		overflow-y: auto;
		border-top: 1px solid var(--line);
		margin-top: 12px;
	}

	.state {
		margin: 0;
		padding: 20px;
		color: var(--muted);
	}

	.state p {
		margin: 0 0 8px;
	}

	.state.error {
		color: #9a3b2a;
	}

	.examples {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 6px;
	}

	.examples a {
		display: block;
		padding: 8px 12px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: #fff;
		color: var(--ink);
		text-decoration: none;
		font-size: 13px;
	}

	.examples a:hover {
		border-color: var(--green);
		color: var(--green);
	}

	.foot {
		padding: 12px 20px;
		border-top: 1px solid var(--line);
		font-size: 11px;
		color: var(--muted);
		text-align: center;
	}

	/* --- Carte + barre de recherche ----------------------------------- */
	.map-area {
		position: relative;
		min-height: 0;
	}

	.search {
		position: absolute;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		width: min(420px, calc(100% - 32px));
		padding: 6px 6px 6px 14px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 999px;
		box-shadow: 0 4px 16px rgb(31 36 32 / 0.12);
	}

	.search-icon {
		flex: none;
		width: 16px;
		height: 16px;
		color: var(--muted);
	}

	.search input {
		flex: 1;
		min-width: 0;
		border: none;
		background: none;
		outline: none;
		font-size: 14px;
	}

	.search input::placeholder {
		color: var(--faint);
	}

	.search:focus-within {
		border-color: var(--green);
	}

	.radius {
		flex: none;
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--cream-deep);
		font-size: 9px;
		line-height: 1.15;
		text-align: center;
		color: var(--muted);
	}

	.go {
		flex: none;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border: none;
		border-radius: 50%;
		background: var(--green);
		color: #fff;
		cursor: pointer;
	}

	.go:hover {
		background: var(--green-dark);
	}

	.go svg {
		width: 14px;
		height: 14px;
	}

	/* --- Mobile : carte en haut, panneau en dessous -------------------- */
	@media (max-width: 760px) {
		.app {
			grid-template-columns: 1fr;
			grid-template-rows: 45dvh 1fr;
		}

		.panel {
			order: 2;
			border-right: none;
			border-top: 1px solid var(--line);
		}

		.map-area {
			order: 1;
		}
	}
</style>
