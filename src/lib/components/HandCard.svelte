<script lang="ts">
    import { fade } from 'svelte/transition';
    import { getRankLabel, SUIT_SYMBOLS } from '$lib/game/logic';
    import type { Card } from '$lib/game/types';

    type Props = {
        card: Card;
        selected?: boolean;
        onSelect?: () => void;
    };

    let { card, selected = false, onSelect }: Props = $props();
</script>

<button
    in:fade={{ duration: 150 }}
    onclick={onSelect}
    class="relative h-25 w-17 overflow-hidden rounded-md border-[1.5px] border-neutral-200 bg-white p-1 shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-transform
    {selected
        ? '-translate-y-1.5 ring-2 ring-black ring-offset-1'
        : 'hover:-translate-y-0.5'}
    {card.color === 'red' ? 'text-red-600' : 'text-neutral-900'}"
>
    <span
        class="absolute left-1.5 top-1 z-10 text-[16px] font-bold leading-none"
    >
        {SUIT_SYMBOLS[card.suit]}
    </span>
    <span
        class="absolute bottom-1 right-1 z-10 rotate-180 text-[16px] font-bold leading-none"
    >
        {SUIT_SYMBOLS[card.suit]}
    </span>

    <span
        class="absolute inset-0 z-10 flex items-center justify-center text-[30px] font-black leading-none"
    >
        {getRankLabel(card.rank)}
    </span>
</button>
