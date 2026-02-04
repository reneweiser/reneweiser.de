<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>René Weiser — Full-Stack Webentwickler</title>
	<meta
		name="description"
		content="Full-Stack Webentwickler mit knapp zehn Jahren Berufserfahrung. Laravel, Vue.js, Svelte, Docker. Vom Frontend bis zum Server."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:title" content="René Weiser — Full-Stack Webentwickler" />
	<meta
		property="og:description"
		content="Full-Stack Webentwickler mit knapp zehn Jahren Berufserfahrung. Laravel, Vue.js, Svelte, Docker."
	/>
	<meta property="og:type" content="website" />
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
