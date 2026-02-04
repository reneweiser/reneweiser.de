<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const siteUrl = 'https://reneweiser.de';
	const title = 'René Weiser — Full-Stack Webentwickler';
	const description =
		'Full-Stack Webentwickler mit knapp zehn Jahren Berufserfahrung. Laravel, Vue.js, Svelte, Docker. Vom Frontend bis zum Server.';

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
				jobTitle: 'Full-Stack Webentwickler',
				description:
					'Full-Stack-Webentwickler mit knapp zehn Jahren Berufserfahrung und einem Hintergrund als selbstständiger Unternehmer.',
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
				sameAs: [
					'https://github.com/reneweiser',
					'https://linkedin.com/in/reneweiser'
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
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="René Weiser" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<!-- Additional SEO -->
	<meta name="geo.region" content="DE" />
	<meta name="geo.placename" content="Deutschland" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="grain min-h-screen">
	<Header />
	<main>
		<Hero />
		<About />
		<TechStack />
		<Projects />
		<Contact />
	</main>
	<Footer />
</div>
