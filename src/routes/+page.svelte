<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Services from '$lib/components/Services.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import About from '$lib/components/About.svelte';
	import BlogPreview from '$lib/components/blog/BlogPreview.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Impressum from '$lib/components/Impressum.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { siteUrl } from '$lib/config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const title = 'René Weiser — Webentwickler für Freelancer & kleine Unternehmen';
	const description =
		'Websites und Webanwendungen für Freelancer und kleine Unternehmen. Individuelle Lösungen von einem Entwickler, der selbst Unternehmer ist.';

	// JSON-LD structured data for Person + WebSite
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${siteUrl}/#website`,
				url: siteUrl,
				name: 'René Weiser',
				description: description,
				inLanguage: 'de-DE'
			},
			{
				'@type': 'Person',
				'@id': `${siteUrl}/#person`,
				name: 'René Weiser',
				url: siteUrl,
				jobTitle: 'Webentwickler & Berater',
				description:
					'Webentwickler für Freelancer und kleine Unternehmen — individuelle Lösungen von einem Entwickler, der selbst Unternehmer ist.',
				knowsAbout: [
					'Laravel',
					'Vue.js',
					'Svelte',
					'PHP',
					'JavaScript',
					'TypeScript',
					'Docker',
					'Linux',
					'REST APIs',
					'CI/CD'
				],
				makesOffer: [
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Webentwicklung',
							description: 'Individuelle Websites für Freelancer und kleine Unternehmen'
						}
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Webanwendungen',
							description: 'Digitale Werkzeuge zur Prozessautomatisierung'
						}
					}
				],
				areaServed: [
					{ '@type': 'Country', name: 'Deutschland' },
					{ '@type': 'Country', name: 'Österreich' },
					{ '@type': 'Country', name: 'Schweiz' }
				],
				sameAs: [
					'https://github.com/reneweiser',
					'https://www.linkedin.com/in/reneweiser'
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${siteUrl}/#faq`,
				mainEntity: [
					{
						'@type': 'Question',
						name: 'Was kostet eine professionelle Website?',
						acceptedAnswer: {
							'@type': 'Answer',
							text: 'Eine einfache Website startet ab 500 EUR. Mit zusätzlichen Leistungen wie Hosting, SEO-Optimierung, individuellem Design oder laufender Betreuung kann der Umfang auf mehrere tausend Euro wachsen. Im kostenlosen Erstgespräch klären wir, was du wirklich brauchst.'
						}
					},
					{
						'@type': 'Question',
						name: 'Wie läuft eine Zusammenarbeit ab?',
						acceptedAnswer: {
							'@type': 'Answer',
							text: 'Erstgespräch (kostenlos, ~20 Min.) → Konzept und Angebot → Umsetzung in Sprints mit regelmäßigem Feedback → Launch und Übergabe. Du bist bei jedem Schritt eingebunden und siehst den Fortschritt live.'
						}
					},
					{
						'@type': 'Question',
						name: 'Was, wenn mir das Ergebnis nicht gefällt?',
						acceptedAnswer: {
							'@type': 'Answer',
							text: 'Jeder Meilenstein hat eine Feedback-Runde, in der wir Anpassungen besprechen. Dadurch entstehen keine Überraschungen am Ende. Du siehst frühzeitig, wohin sich das Projekt entwickelt, und kannst jederzeit Korrekturen einbringen.'
						}
					},
					{
						'@type': 'Question',
						name: 'WordPress oder individuell — was ist der Unterschied?',
						acceptedAnswer: {
							'@type': 'Answer',
							text: 'WordPress ist gut für Standardseiten mit Blog. Eine individuelle Lösung lohnt sich, wenn du besondere Funktionen brauchst, maximale Performance willst oder dich nicht mit Plugin-Updates und Sicherheitslücken herumschlagen möchtest.'
						}
					}
				]
			}
		]
	};
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta name="author" content="René Weiser" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={siteUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{siteUrl}/og-default.webp" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="René Weiser" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{siteUrl}/og-default.webp" />

	<!-- Additional SEO -->
	<meta name="geo.region" content="DE" />
	<meta name="geo.placename" content="Deutschland" />

	<link
		rel="alternate"
		type="application/rss+xml"
		title="René Weiser — Blog"
		href="/feed.xml"
	/>

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="grain min-h-screen">
	<Header />
	<main>
		<Hero />
		<Services />
		<Projects />
		<About />
		<BlogPreview posts={data.posts} />
		<FAQ />
		<Contact />
		<Impressum />
	</main>
	<Footer />
</div>
