<script>
	import Photo from './Photo.svelte';
	import Price from './Price.svelte';
	import { formatDistance, pageHref } from '#lib/format.js';

	// Liste des restaurants (déjà triés par distance). Chaque ligne est un lien qui ouvre la fiche.

	/**
	 * @type {{
	 *   query: string,
	 *   restaurants: import('#lib/server/restaurants.js').NearbyRestaurant[]
	 * }}
	 */
	let { query, restaurants } = $props();
</script>

<ol class="list">
	{#each restaurants as r, i (r.id)}
		<li>
			<a
				class="item"
				class:closest={i === 0}
				href={pageHref(query, r.id)}
				data-sveltekit-reset="false"
			>
				<span class="rank">{i + 1}</span>
				<span class="thumb"><Photo url={r.cover_url} seed={r.slug} small /></span>
				<span class="text">
					<span class="name">{r.name}</span>
					<span class="meta">{r.tagline} · {r.neighborhood}</span>
				</span>
				<span class="side">
					<Price tier={r.price_tier} />
					<span class="distance" class:badge={i === 0}>
						{i === 0 ? 'Le plus proche · ' : ''}{formatDistance(r.distance)}
					</span>
				</span>
			</a>
		</li>
	{/each}
</ol>

<style>
	.list {
		list-style: none;
		margin: 0;
		padding: 4px 8px 12px;
	}

	.item {
		display: grid;
		grid-template-columns: 22px 40px 1fr auto;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border: 1px solid transparent;
		border-radius: var(--radius);
		text-decoration: none;
		transition: background-color 120ms;
	}

	.item:hover {
		background: var(--cream-deep);
	}

	.item.closest {
		background: var(--peach);
		border-color: var(--peach-line);
	}

	.rank {
		font-family: var(--font-serif);
		font-size: 20px;
		font-weight: 600;
		text-align: center;
	}

	.thumb {
		display: block;
		width: 40px;
		height: 40px;
	}

	.text {
		display: grid;
		min-width: 0;
	}

	.name {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		font-size: 12px;
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.side {
		display: grid;
		justify-items: end;
		gap: 2px;
		font-size: 13px;
	}

	.distance {
		font-size: 11px;
		color: var(--muted);
		white-space: nowrap;
	}

	.distance.badge {
		color: var(--gold);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 10px;
	}
</style>
