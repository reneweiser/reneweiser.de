<script lang="ts">
	import {
		PUBLIC_IMPRESSUM_NAME,
		PUBLIC_IMPRESSUM_STREET,
		PUBLIC_IMPRESSUM_CITY,
		PUBLIC_IMPRESSUM_EMAIL
	} from '$env/static/public';
</script>

<section id="impressum" class="border-t border-ink/10 bg-paper px-6 py-16 lg:px-8">
	<div class="mx-auto max-w-6xl">
		<h2 class="mb-8 font-display text-2xl tracking-tight text-ink">Impressum</h2>

		<div class="max-w-xl space-y-6 text-sm text-ink-muted">
			<div>
				<p class="font-medium text-ink">Angaben gemäß § 5 DDG</p>
			</div>

			<div>
				<p class="font-medium text-ink">{PUBLIC_IMPRESSUM_NAME}</p>
				<p>{PUBLIC_IMPRESSUM_STREET}</p>
				<p>{PUBLIC_IMPRESSUM_CITY}</p>
			</div>

			<div>
				<p class="font-medium text-ink">Kontakt</p>
				<p>
					E-Mail:
					<a
						href="mailto:{PUBLIC_IMPRESSUM_EMAIL}"
						class="text-copper transition-colors hover:text-copper-dark"
					>
						{PUBLIC_IMPRESSUM_EMAIL}
					</a>
				</p>
			</div>

			<div class="pt-4 text-xs text-ink-soft">
				<p>
					Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: {PUBLIC_IMPRESSUM_NAME} (Anschrift wie oben)
				</p>
			</div>
		</div>
	</div>
</section>
