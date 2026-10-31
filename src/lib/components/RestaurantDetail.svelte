<script>
	import Photo from './Photo.svelte';
	import Price from './Price.svelte';
	import { formatDistance } from '#lib/format.js';

	// Fiche d'un restaurant, affichée à la place de la liste.
	// Le bouton retour renvoie vers la même recherche sans id, donc la liste réapparaît.

	/**
	 * @type {{
	 *   restaurant: NonNullable<ReturnType<typeof import('#lib/server/restaurants.js').getRestaurant>>,
	 *   distance: number | null,
	 *   backHref: string
	 * }}
	 */
	let { restaurant: r, distance, backHref } = $props();

	// 1re photo en grand, les autres en vignettes
	const [hero, ...others] = $derived(r.photos);
	// Itinéraire Google Maps vers le restaurant
	const directionsUrl = $derived(
		`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`
	);
</script>

<article class="detail">
	<header class="top">
		<a class="back" href={backHref} data-sveltekit-reset="false">
			<svg viewBox="0 0 16 16" aria-hidden="true"
				><path d="M13 8H3m4-4L3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.5" /></svg
			>
			Retour à la liste
		</a>
	</header>

	<div class="scroll">
		{#if hero}
			<div class="gallery">
				<div class="hero">
					<Photo url={hero.url} alt={hero.alt_text} caption={hero.caption} seed={r.slug} />
				</div>
				{#each others as photo, i (i)}
					<div class="thumb">
						<Photo url={photo.url} alt={photo.alt_text} caption={photo.caption} seed={r.slug + i} />
					</div>
				{/each}
			</div>
		{/if}

		<h2 class="name">{r.name}</h2>

		<div class="facts">
			{#each r.tags as tag (tag)}
				<span class="tag">{tag}</span>
			{/each}
			<span class="dot" aria-hidden="true">·</span>
			<Price tier={r.price_tier} />
			{#if r.rating_count > 0}
				<span class="dot" aria-hidden="true">·</span>
				<span class="rating">
					<span class="star" aria-hidden="true">★</span>
					<strong>{r.rating_avg.toFixed(1).replace('.', ',')}</strong>
					<span class="count">({r.rating_count} avis)</span>
				</span>
			{/if}
		</div>

		{#if r.description}
			<p class="description">{r.description}</p>
		{/if}

		<div class="address">
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<path
					d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14Z"
					fill="none"
					stroke="currentColor"
					stroke-width="1.3"
				/>
				<circle cx="8" cy="6.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.3" />
			</svg>
			<div>
				<p>
					{r.street_address}, {r.city}
					{r.postcode} · {r.neighborhood}
				</p>
				{#if distance != null}
					<p class="muted">À {formatDistance(distance)} de votre recherche</p>
				{/if}
				<a class="directions" href={directionsUrl} target="_blank" rel="noreferrer">
					Itinéraire ↗
				</a>
			</div>
		</div>
	</div>

	{#if r.phone}
		<footer class="bottom">
			<p class="book">
				<svg viewBox="0 0 16 16" aria-hidden="true"
					><path
						d="M4 1.5v5a1.5 1.5 0 0 0 1.5 1.5M4 1.5v13M2.5 1.5v4M5.5 1.5v4M11.5 14.5v-13C10 1.5 9 3.3 9 6v3h2.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.3"
						stroke-linecap="round"
					/></svg
				>
				Réserver · {r.phone}
			</p>
		</footer>
	{/if}
</article>

<style>
	.detail {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.top {
		padding: 14px 20px;
		border-bottom: 1px solid var(--line);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		text-decoration: none;
	}

	.back:hover {
		color: var(--green);
	}

	.back svg {
		width: 14px;
		height: 14px;
	}

	.scroll {
		flex: 1;
		overflow-y: auto;
		padding: 16px 20px 24px;
	}

	.gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.hero {
		grid-column: 1 / -1;
		aspect-ratio: 16 / 10;
	}

	.thumb {
		aspect-ratio: 16 / 11;
	}

	.name {
		margin: 22px 0 10px;
		font-family: var(--font-serif);
		font-size: 28px;
		font-weight: 700;
		line-height: 1.1;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 8px;
		font-size: 13px;
	}

	.tag {
		padding: 2px 8px;
		border: 1px solid var(--line);
		border-radius: 999px;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
		background: #fff;
	}

	.dot {
		color: var(--muted);
	}

	.star {
		color: var(--gold);
	}

	.count {
		color: var(--muted);
		font-size: 12px;
	}

	.description {
		margin: 12px 0 18px;
		color: #474b45;
		line-height: 1.6;
	}

	.address {
		display: flex;
		gap: 10px;
		padding-top: 16px;
		border-top: 1px solid var(--line);
		font-size: 13px;
	}

	.address svg {
		flex: none;
		width: 16px;
		height: 16px;
		margin-top: 2px;
		color: var(--muted);
	}

	.address p {
		margin: 0;
	}

	.muted {
		color: var(--muted);
		font-size: 12px;
	}

	.directions {
		display: inline-block;
		margin-top: 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--green);
		text-decoration: none;
	}

	.directions:hover {
		text-decoration: underline;
	}

	.bottom {
		padding: 14px 20px;
		border-top: 1px solid var(--line);
	}

	.book {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 0;
		padding: 11px;
		border-radius: 999px;
		background: var(--green);
		color: #fff;
		font-weight: 600;
	}

	.book svg {
		width: 15px;
		height: 15px;
	}
</style>
