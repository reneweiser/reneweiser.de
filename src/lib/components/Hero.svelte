<script lang="ts">
	// Terminal-style blinking cursor effect
	let cursorVisible = $state(true);

	$effect(() => {
		const interval = setInterval(() => {
			cursorVisible = !cursorVisible;
		}, 530);
		return () => clearInterval(interval);
	});
</script>

<section class="relative min-h-screen overflow-hidden px-6 pt-32 pb-20 lg:px-8 lg:pt-40">
	<!-- Decorative grid background -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image:
			linear-gradient(var(--color-ink) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-ink) 1px, transparent 1px);
		background-size: 60px 60px;"
	></div>

	<!-- Decorative copper accent line -->
	<div
		class="absolute top-0 left-1/4 h-40 w-px bg-gradient-to-b from-copper/40 to-transparent animate-fade-in delay-5"
	></div>

	<div class="relative mx-auto max-w-6xl">
		<!-- Eyebrow / Terminal prompt -->
		<div class="mb-8 animate-fade-up delay-1">
			<span class="font-mono text-sm text-ink-soft">
				<span class="text-copper">$</span> whoami
			</span>
		</div>

		<!-- Main headline -->
		<h1 class="mb-6 max-w-4xl">
			<span class="font-display text-5xl leading-[1.1] tracking-tight text-ink md:text-7xl lg:text-8xl animate-fade-up delay-2 block">
				Full-Stack
			</span>
			<span class="font-display text-5xl leading-[1.1] tracking-tight text-ink md:text-7xl lg:text-8xl animate-fade-up delay-3 block">
				Webentwickler<span class="text-copper">.</span>
			</span>
		</h1>

		<!-- Secondary headline with italic emphasis -->
		<p class="mb-12 max-w-2xl font-display text-2xl text-ink-muted md:text-3xl animate-fade-up delay-4">
			Vom Frontend bis zum Server<span class="text-copper">—</span><br class="hidden sm:block" />
			<em class="text-ink">end-to-end</em>.
		</p>

		<!-- Subline / description -->
		<div class="mb-16 max-w-xl animate-fade-up delay-5">
			<p class="text-lg leading-relaxed text-ink-muted">
				Ich entwickle und betreibe Webanwendungen end-to-end — von der Benutzeroberfläche über
				die Backend-Architektur bis zum Deployment. Seit fast zehn Jahren, mit eigenem Unternehmen
				und dem Anspruch, Software zu liefern, die im echten Betrieb funktioniert.
			</p>
		</div>

		<!-- CTA -->
		<div class="flex flex-wrap items-center gap-6 animate-fade-up delay-6">
			<a
				href="#projekte"
				class="group inline-flex items-center gap-3 border-b-2 border-ink pb-2 font-mono text-sm font-medium text-ink transition-all hover:border-copper hover:text-copper"
			>
				Projekte ansehen
				<span class="transition-transform group-hover:translate-x-1">↓</span>
			</a>
			<a
				href="#kontakt"
				class="inline-flex items-center gap-2 font-mono text-sm text-ink-soft transition-colors hover:text-copper"
			>
				<span class="h-2 w-2 rounded-full bg-sage animate-pulse"></span>
				Verfügbar für neue Projekte
			</a>
		</div>

		<!-- Decorative terminal block -->
		<div class="absolute right-0 bottom-0 hidden w-80 lg:block animate-fade-in delay-7">
			<div class="rounded-lg border border-ink/10 bg-ink/[0.02] p-4 font-mono text-xs">
				<div class="mb-3 flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full bg-copper/60"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-sage/60"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-ink-soft/40"></span>
				</div>
				<div class="space-y-1 text-ink-soft">
					<p><span class="text-copper">const</span> developer = {'{'}</p>
					<p class="pl-4">name: <span class="text-sage">'René Weiser'</span>,</p>
					<p class="pl-4">stack: <span class="text-sage">'Full-Stack'</span>,</p>
					<p class="pl-4">focus: <span class="text-sage">'Web'</span>,</p>
					<p class="pl-4">status: <span class="text-sage">'verfügbar'</span></p>
					<p>{'}'}<span class:opacity-0={!cursorVisible} class="text-copper transition-opacity">_</span></p>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-7">
		<div class="flex flex-col items-center gap-2 text-ink-soft">
			<span class="h-8 w-px bg-gradient-to-b from-transparent via-ink-soft/50 to-transparent animate-pulse"></span>
		</div>
	</div>
</section>
