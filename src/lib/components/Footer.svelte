<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-ink/10 bg-paper px-6 py-8 lg:px-8">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
		<!-- Copyright -->
		<p class="font-mono text-xs text-ink-soft">
			© {currentYear} René Weiser
		</p>

		<!-- Built with -->
		<p class="font-mono text-xs text-ink-soft">
			Gebaut mit
			<a
				href="https://kit.svelte.dev"
				target="_blank"
				rel="noopener noreferrer"
				class="text-copper transition-colors hover:text-copper-dark"
			>
				SvelteKit
			</a>
		</p>

		<!-- Back to top -->
		<button
			onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			class="group inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-copper"
		>
			Nach oben
			<span class="transition-transform group-hover:-translate-y-0.5">↑</span>
		</button>
	</div>
</footer>
