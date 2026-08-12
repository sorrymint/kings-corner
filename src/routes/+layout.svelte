<script lang="ts">
    import AppHeader from '$lib/components/AppHeader.svelte';
    import PageFooter from '$lib/components/PageFooter.svelte';
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';

    let { children } = $props();
</script>

<svelte:head>
    <title>Kings Corner</title>
    <meta
        name="description"
        content="Play Kings in the Corner against the computer in a simple browser card game."
    />
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
    <AppHeader />
    <div class="flex-1">
        {@render children()}
    </div>
    <PageFooter />
</div>
