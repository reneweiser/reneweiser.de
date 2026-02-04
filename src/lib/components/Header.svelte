<script lang="ts">
	let isScrolled = $state(false);
	let isMobileMenuOpen = $state(false);

	const navItems = [
		{ href: '#ueber-mich', label: 'Über mich' },
		{ href: '#stack', label: 'Stack' },
		{ href: '#projekte', label: 'Projekte' },
		{ href: '#kontakt', label: 'Kontakt' }
	];

	function handleScroll() {
		isScrolled = window.scrollY > 50;
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
	class:bg-paper={isScrolled}
	class:shadow-sm={isScrolled}
	class:backdrop-blur-md={isScrolled}
>
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
		<!-- Logo / Name -->
		<button
			onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			class="font-display text-xl tracking-tight text-ink transition-colors hover:text-copper animate-fade-in"
		>
			René Weiser
		</button>

		<!-- Desktop Navigation -->
		<ul class="hidden items-center gap-8 md:flex">
			{#each navItems as item, i}
				<li class="animate-fade-in" style="animation-delay: {(i + 1) * 0.1}s">
					<a
						href={item.href}
						class="font-mono text-sm text-ink-muted transition-colors hover:text-copper"
					>
						<span class="text-copper/60">0{i + 1}.</span>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Mobile Menu Button -->
		<button
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			class="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
			aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
			aria-expanded={isMobileMenuOpen}
		>
			<span
				class="h-0.5 w-6 bg-ink transition-all duration-300"
				class:rotate-45={isMobileMenuOpen}
				class:translate-y-2={isMobileMenuOpen}
			></span>
			<span
				class="h-0.5 w-6 bg-ink transition-all duration-300"
				class:opacity-0={isMobileMenuOpen}
			></span>
			<span
				class="h-0.5 w-6 bg-ink transition-all duration-300"
				class:-rotate-45={isMobileMenuOpen}
				class:-translate-y-2={isMobileMenuOpen}
			></span>
		</button>
	</nav>

	<!-- Mobile Menu Overlay -->
	{#if isMobileMenuOpen}
		<div
			class="fixed inset-0 z-40 bg-paper/98 backdrop-blur-lg md:hidden"
			role="dialog"
			aria-modal="true"
		>
			<nav class="flex h-full flex-col items-center justify-center gap-8">
				{#each navItems as item, i}
					<a
						href={item.href}
						onclick={closeMobileMenu}
						class="font-display text-3xl text-ink transition-colors hover:text-copper animate-fade-up"
						style="animation-delay: {i * 0.1}s"
					>
						<span class="font-mono text-base text-copper/60">0{i + 1}.</span>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>

<style>
	.bg-paper {
		background-color: color-mix(in srgb, var(--color-paper) 85%, transparent);
	}
</style>
