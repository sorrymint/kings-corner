<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';

    function triggerNewGame() {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('kings-corner-save');
            window.dispatchEvent(new CustomEvent('kings-corner:clear-save'));
            window.dispatchEvent(new CustomEvent('kings-corner:new-game'));
        }
    }
</script>

<header class="border-b border-neutral-300 bg-white">
    <div
        class="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3"
    >
        <div class="min-w-0">
            <img src={favicon} alt="Kings in the Corner" class="h-6 w-6" />
            <a href="/" aria-label="Kings in the Corner">
                <h1 class="truncate text-base font-bold">
                    Kings in the Corner
                </h1>
            </a>
        </div>

        <nav class="flex flex-wrap items-center justify-end gap-2">
            <a
                href="/how-to-play"
                class="inline-flex items-center border border-neutral-800 bg-neutral-800 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700 active:bg-neutral-900"
                >How to Play</a
            >
            <button
                onclick={triggerNewGame}
                class="inline-flex items-center border border-neutral-800 px-2 py-1 text-xs font-medium text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200"
                >New Game</button
            >
        </nav>
    </div>
</header>
