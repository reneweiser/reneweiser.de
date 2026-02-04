<script lang="ts">
	interface Project {
		title: string;
		description: string;
		contribution: string;
		stack: string[];
		liveUrl?: string;
		githubUrl?: string;
	}

	const projects: Project[] = [
		{
			title: 'E-Commerce-Plattform',
			description: 'Maßgeschneiderte Online-Shop-Lösung für einen mittelständischen Händler.',
			contribution:
				'Vollständige Entwicklung von Backend und Frontend. REST API mit Laravel, Vue.js-basiertes Storefront, Admin-Dashboard mit Echtzeit-Bestandsverwaltung.',
			stack: ['Laravel', 'Vue.js', 'MySQL', 'Redis', 'Docker']
		},
		{
			title: 'SaaS-Buchungsplattform',
			description: 'Multi-Tenant Buchungssystem für Dienstleister mit Online-Terminvergabe.',
			contribution:
				'Architektur und Implementierung des Multi-Tenant-Systems. Kalender-Integration, automatisierte E-Mail-Benachrichtigungen, Stripe-Payment-Integration.',
			stack: ['Laravel', 'Livewire', 'PostgreSQL', 'Stripe', 'GitHub Actions']
		},
		{
			title: 'Unternehmens-Dashboard',
			description: 'Internes Reporting-Tool mit Echtzeit-Datenvisualisierung.',
			contribution:
				'Frontend-Architektur mit Svelte, Anbindung an verschiedene Datenquellen via REST APIs, responsive Charts und interaktive Filter.',
			stack: ['Svelte', 'TypeScript', 'D3.js', 'REST API']
		},
		{
			title: 'DevOps & Infrastruktur',
			description: 'Container-basierte Deployment-Pipelines für Web-Applikationen.',
			contribution:
				'Aufbau von CI/CD-Pipelines mit GitHub Actions, Docker-Compose-Setups für Entwicklung und Produktion, Monitoring mit Prometheus/Grafana.',
			stack: ['Docker', 'GitHub Actions', 'Linux', 'Nginx', 'Prometheus']
		}
	];

	let hoveredIndex = $state<number | null>(null);
</script>

<section id="projekte" class="relative px-6 py-24 lg:px-8 lg:py-32">
	<!-- Background accent -->
	<div class="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-paper-muted/30 to-transparent"></div>

	<div class="relative mx-auto max-w-6xl">
		<!-- Section header -->
		<div class="mb-16 flex items-baseline gap-4">
			<span class="font-mono text-sm text-copper">03.</span>
			<h2 class="font-display text-4xl tracking-tight text-ink md:text-5xl">Projekte</h2>
			<div class="hidden h-px flex-1 bg-ink/10 sm:block"></div>
		</div>

		<!-- Projects grid -->
		<div class="grid gap-6 lg:gap-8">
			{#each projects as project, i}
				<article
					class="group relative rounded-lg border border-ink/10 bg-paper p-6 transition-all duration-300 hover:border-copper/30 hover:shadow-lg hover:shadow-copper/5 lg:p-8"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={() => (hoveredIndex = null)}
				>
					<!-- Project number indicator -->
					<div
						class="absolute -left-3 top-6 hidden w-6 text-right font-mono text-sm text-copper/40 transition-colors group-hover:text-copper lg:block"
					>
						{String(i + 1).padStart(2, '0')}
					</div>

					<div class="grid gap-6 lg:grid-cols-12 lg:gap-8">
						<!-- Content -->
						<div class="lg:col-span-8">
							<header class="mb-4">
								<h3
									class="font-display text-xl text-ink transition-colors group-hover:text-copper lg:text-2xl"
								>
									{project.title}
								</h3>
								<p class="mt-1 text-ink-soft">{project.description}</p>
							</header>

							<div class="mb-4">
								<p class="text-sm leading-relaxed text-ink-muted">{project.contribution}</p>
							</div>

							<!-- Links -->
							{#if project.liveUrl || project.githubUrl}
								<div class="flex gap-4">
									{#if project.liveUrl}
										<a
											href={project.liveUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-copper"
										>
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
											</svg>
											Live ansehen
										</a>
									{/if}
									{#if project.githubUrl}
										<a
											href={project.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 font-mono text-xs text-ink-soft transition-colors hover:text-copper"
										>
											<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
											</svg>
											GitHub
										</a>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Stack tags -->
						<div class="flex flex-wrap items-start gap-2 lg:col-span-4 lg:justify-end">
							{#each project.stack as tech}
								<span
									class="rounded-full border border-ink/10 bg-paper-muted/50 px-3 py-1 font-mono text-xs text-ink-muted transition-all group-hover:border-copper/20 group-hover:bg-copper/5"
								>
									{tech}
								</span>
							{/each}
						</div>
					</div>

					<!-- Hover accent line -->
					<div
						class="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-copper to-copper-light transition-all duration-500 group-hover:w-full"
					></div>
				</article>
			{/each}
		</div>

		<!-- Note about projects -->
		<p class="mt-8 text-center font-mono text-xs text-ink-soft">
			// Weitere Projekte auf Anfrage.
		</p>
	</div>
</section>
