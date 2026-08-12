<script lang="ts">
    import { fade } from 'svelte/transition';
    import { getRankLabel, SUIT_SYMBOLS } from '$lib/game/logic';
    import type { Card } from '$lib/game/types';

    type Props = {
        label: string;
        pile: Card[];
        selected?: boolean;
        variant?: 'normal' | 'corner';
        highlight?: boolean;
        onSelect?: () => void;
    };

    let {
        pile,
        selected = false,
        variant = 'normal',
        highlight = false,
        onSelect,
    }: Props = $props();

    const topCard = $derived(pile.at(-1) ?? null);
</script>

<button
    onclick={onSelect}
    class="relative h-32 w-22 overflow-hidden rounded-md border-[3px] border-neutral-200 bg-white p-1 text-left shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-transform
    {variant === 'corner' && pile.length === 0
        ? 'border-dashed border-neutral-400 bg-neutral-50'
        : 'border-neutral-300 bg-white'}
    {selected
        ? '-translate-y-1.5 ring-2 ring-black ring-offset-1'
        : 'hover:-translate-y-0.5'}
    {highlight ? 'ring-2 ring-neutral-900 ring-offset-1 bg-neutral-100' : ''}"
>
    {#if topCard}
        <div class="relative z-10 h-full" in:fade={{ duration: 120 }}>
            <span
                class="absolute left-1.5 top-1 text-[15px] font-bold leading-none {topCard.color ===
                'red'
                    ? 'text-red-600'
                    : 'text-neutral-900'}"
            >
                {SUIT_SYMBOLS[topCard.suit]}
            </span>
            <span
                class="absolute bottom-1 right-1 rotate-180 text-[15px] font-bold leading-none {topCard.color ===
                'red'
                    ? 'text-red-600'
                    : 'text-neutral-900'}"
            >
                {SUIT_SYMBOLS[topCard.suit]}
            </span>

            <span
                class="absolute inset-0 flex items-center justify-center text-[30px] font-black leading-none {topCard.color ===
                'red'
                    ? 'text-red-600'
                    : 'text-neutral-900'}"
            >
                {getRankLabel(topCard.rank)}
            </span>

            <span
                class="absolute inset-x-0 bottom-1 flex justify-center text-[9px] text-neutral-700"
            >
                Depth: {pile.length}
            </span>
        </div>
    {:else}
        <div
            class="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-neutral-300"
        >
            {variant === 'corner' ? 'Corner' : ''}
        </div>
    {/if}
</button>
