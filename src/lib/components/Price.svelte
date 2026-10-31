<script>
	// Prix de 1 à 4 : tier = 2 → "€€" en foncé + "€€" en clair, comme sur la maquette
	/** @type {{ tier: number }} */
	let { tier } = $props();
</script>

<span class="price" aria-label="Niveau de prix {tier} sur 4">
	<span aria-hidden="true">{'€'.repeat(tier)}</span><span class="rest" aria-hidden="true"
		>{'€'.repeat(4 - tier)}</span
	>
</span>

<style>
	.price {
		font-weight: 600;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.rest {
		color: var(--faint);
		font-weight: 500;
	}
</style>
