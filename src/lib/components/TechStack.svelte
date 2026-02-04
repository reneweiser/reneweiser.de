<script lang="ts">
	interface TechCategory {
		title: string;
		items: string[];
	}

	const categories: TechCategory[] = [
		{
			title: 'Frontend',
			items: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'Svelte']
		},
		{
			title: 'Backend',
			items: ['PHP', 'Laravel', 'REST APIs', 'Relationale Datenbanken', 'Eloquent ORM']
		},
		{
			title: 'Infrastruktur',
			items: ['Linux', 'Docker', 'CI/CD', 'GitHub Actions', 'Server-Administration', 'Monitoring']
		},
		{
			title: 'Workflow',
			items: ['Git', 'Code Review', 'Agile Entwicklung', 'Technische Dokumentation']
		}
	];
</script>

<section id="stack" class="relative bg-ink px-6 py-24 lg:px-8 lg:py-32">
	<!-- Subtle grid pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image:
			linear-gradient(var(--color-paper) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-paper) 1px, transparent 1px);
		background-size: 40px 40px;"
	></div>

	<div class="relative mx-auto max-w-6xl">
		<!-- Section header -->
		<div class="mb-16 flex items-baseline gap-4">
			<span class="font-mono text-sm text-copper">02.</span>
			<h2 class="font-display text-4xl tracking-tight text-paper md:text-5xl">Tech-Stack</h2>
			<div class="hidden h-px flex-1 bg-paper/10 sm:block"></div>
		</div>

		<!-- Tech categories grid -->
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each categories as category, i}
				<div class="group">
					<!-- Category header -->
					<div class="mb-4 flex items-center gap-2">
						<span class="font-mono text-xs text-copper">//</span>
						<h3 class="font-mono text-sm uppercase tracking-wider text-paper/60">
							{category.title}
						</h3>
					</div>

					<!-- Tech items -->
					<ul class="space-y-2">
						{#each category.items as item}
							<li
								class="flex items-center gap-2 text-paper/80 transition-colors group-hover:text-paper"
							>
								<span class="h-1 w-1 rounded-full bg-copper/60"></span>
								<span class="text-sm">{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Decorative terminal-style output -->
		<div class="mt-16 rounded-lg border border-paper/10 bg-paper/[0.02] p-6 font-mono text-sm">
			<div class="flex flex-wrap gap-x-8 gap-y-2 text-paper/50">
				<span>
					<span class="text-copper">$</span> years_experience
					<span class="text-sage-light">~10</span>
				</span>
				<span>
					<span class="text-copper">$</span> projects_shipped
					<span class="text-sage-light">50+</span>
				</span>
				<span>
					<span class="text-copper">$</span> approach
					<span class="text-sage-light">"pragmatic && reliable"</span>
				</span>
			</div>
		</div>
	</div>
</section>
