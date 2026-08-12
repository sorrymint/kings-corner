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
  in:fade={{ duration: 120 }}
  onclick={onSelect}
  class="w-14 h-20 border p-1 flex flex-col justify-between text-left rounded-sm transition-transform
    {selected ? '-translate-y-2 ring-2 ring-black' : 'border-neutral-300'}
    {card.color === 'red' ? 'text-red-600' : 'text-black'} bg-white"
>
  <span class="font-bold text-sm">{getRankLabel(card.rank)}</span>
  <span class="text-base self-end">{SUIT_SYMBOLS[card.suit]}</span>
</button>
