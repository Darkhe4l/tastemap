<script>
	/**
	 * Photo d'un plat, ou une tuile colorée si l'image n'existe pas.
	 * @type {{ url: string | null, alt?: string | null, seed?: string, caption?: string | null, small?: boolean }}
	 */
	let { url, alt = '', seed = '', caption = null, small = false } = $props();

	// Passe à true si l'image ne charge pas
	let failed = $state(false);

	// Couleur calculée à partir du nom : chaque restaurant garde toujours la même
	const hue = $derived([...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 17));
</script>

<figure class="photo" class:small style="--hue: {hue}">
	{#if url && !failed}
		<img src={url} alt={alt ?? ''} loading="lazy" onerror={() => (failed = true)} />
	{:else}
		<div class="placeholder" role="img" aria-label={alt ?? ''}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M7 2v9a2 2 0 0 1-2 2v9M3 2v6a2 2 0 0 0 4 0V2M5 2v6M17 22V2c-2.2 0-4 2.7-4 6v5h4"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	{/if}
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	.photo {
		position: relative;
		margin: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 8px;
		background: var(--cream-deep);
	}

	img,
	.placeholder {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 30% 25%, hsl(var(--hue) 55% 82%), transparent 60%),
			linear-gradient(135deg, hsl(var(--hue) 38% 62%), hsl(calc(var(--hue) + 40) 35% 38%));
		color: hsl(var(--hue) 40% 96% / 0.85);
	}

	.placeholder svg {
		width: 28%;
		max-width: 44px;
		min-width: 14px;
	}

	.small {
		border-radius: 6px;
	}

	figcaption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 18px 8px 6px;
		font-size: 11px;
		font-weight: 500;
		color: #fff;
		background: linear-gradient(transparent, rgb(0 0 0 / 0.55));
	}
</style>
