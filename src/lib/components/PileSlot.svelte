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

  let { label, pile, selected = false, variant = 'normal', highlight = false, onSelect }: Props = $props();

  const topCard = $derived(pile.at(-1) ?? null);
</script>

<button
  onclick={onSelect}
  class="h-28 border p-1 flex flex-col justify-between text-left transition-all
    {variant === 'corner' ? 'border-dashed border-neutral-400 bg-neutral-50' : 'border-neutral-300 bg-white'}
    {selected ? 'ring-2 ring-black' : ''}
    {highlight ? 'ring-2 ring-neutral-900 bg-neutral-100' : ''}"
>
  <span class="text-[10px] text-neutral-400">{label}</span>

  {#if topCard}
    <div class="text-base font-bold {topCard.color === 'red' ? 'text-red-600' : 'text-black'}" in:fade={{ duration: 120 }}>
      {getRankLabel(topCard.rank)}{SUIT_SYMBOLS[topCard.suit]}
    </div>
    <span class="text-[10px] text-neutral-500">Depth: {pile.length}</span>
  {/if}
</button>
