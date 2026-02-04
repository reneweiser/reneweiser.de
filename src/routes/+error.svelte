<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Seite nicht gefunden — René Weiser</title>
</svelte:head>

<div class="grain min-h-screen flex items-center justify-center px-6">
	<div class="text-center">
		<h1 class="text-6xl font-bold text-stone-900 mb-4">{page.status}</h1>
		<p class="text-xl text-stone-600 mb-8">
			{#if page.status === 404}
				Diese Seite existiert nicht.
			{:else}
				Ein Fehler ist aufgetreten.
			{/if}
		</p>
		<a
			href="/"
			class="inline-block px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
		>
			Zurück zur Startseite
		</a>
	</div>
</div>
