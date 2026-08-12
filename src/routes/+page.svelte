<script lang="ts">
    const STORAGE_KEY = 'kings-corner-save';

    import HandCard from '$lib/components/HandCard.svelte';
    import PileSlot from '$lib/components/PileSlot.svelte';
    import { resolveComputerTurn } from '$lib/game/ai';
    import {
        createStartingBoard,
        getRankLabel,
        isValidMove,
        PILE_NAMES,
        SUIT_SYMBOLS,
    } from '$lib/game/logic';
    import type { Card, Turn } from '$lib/game/types';

    type GameState = {
        deck: Card[];
        playerHand: Card[];
        computerHand: Card[];
        piles: Card[][];
        currentTurn: Turn;
        hasDrawnCard: boolean;
        selectedHandIndex: number | null;
        selectedPileIndex: number | null;
        statusMessage: string;
        cpuHighlight: number | null;
    };

    function createFreshGame(): GameState {
        const nextState = createStartingBoard();

        return {
            deck: nextState.deck,
            playerHand: nextState.playerHand,
            computerHand: nextState.computerHand,
            piles: nextState.piles,
            currentTurn: 'player',
            hasDrawnCard: false,
            selectedHandIndex: null,
            selectedPileIndex: null,
            statusMessage: 'Game started. Draw a card to begin your turn.',
            cpuHighlight: null,
        };
    }

    function restoreSavedGame(): GameState | null {
        if (typeof localStorage === 'undefined') return null;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        try {
            const parsed = JSON.parse(saved) as Partial<GameState>;
            if (!Array.isArray(parsed.piles) || !Array.isArray(parsed.deck)) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return {
                ...createFreshGame(),
                ...parsed,
                piles: parsed.piles.map((pile) => pile ?? []),
            };
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }

    let game = $state<GameState>(restoreSavedGame() ?? createFreshGame());

    let isGameOver = $derived(
        game.playerHand.length === 0 || game.computerHand.length === 0,
    );
    let winner = $derived(
        game.playerHand.length === 0
            ? 'Player'
            : game.computerHand.length === 0
              ? 'Computer'
              : null,
    );

    import { onMount } from 'svelte';

    function saveGame() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    }

    function resetGame() {
        game = createFreshGame();
        saveGame();
    }

    onMount(() => {
        const handleNewGame = () => {
            startNewGame();
        };

        const handleClearSave = () => {
            game = createFreshGame();
            saveGame();
        };

        window.addEventListener('kings-corner:new-game', handleNewGame);
        window.addEventListener('kings-corner:clear-save', handleClearSave);

        return () => {
            window.removeEventListener('kings-corner:new-game', handleNewGame);
            window.removeEventListener(
                'kings-corner:clear-save',
                handleClearSave,
            );
        };
    });

    function startNewGame() {
        if (
            typeof window !== 'undefined' &&
            !confirm('Start a new game? Your current progress will be lost.')
        ) {
            return;
        }

        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }

        resetGame();
    }

    function drawCard() {
        if (game.currentTurn !== 'player' || game.hasDrawnCard) return;

        if (game.deck.length > 0) {
            const drawnCard = game.deck.pop()!;
            game.playerHand = [...game.playerHand, drawnCard];
            game.deck = [...game.deck];
            game.statusMessage = `Drew ${getRankLabel(drawnCard.rank)}${SUIT_SYMBOLS[drawnCard.suit]}.`;
        } else {
            game.statusMessage = 'Deck is empty.';
        }

        game.hasDrawnCard = true;
        saveGame();
    }

    function handleHandCardClick(index: number) {
        if (game.currentTurn !== 'player' || !game.hasDrawnCard) return;
        game.selectedPileIndex = null;
        game.selectedHandIndex =
            game.selectedHandIndex === index ? null : index;
    }

    function handlePileClick(targetIndex: number) {
        if (game.currentTurn !== 'player' || !game.hasDrawnCard) return;

        const targetPile = game.piles[targetIndex];

        if (game.selectedHandIndex !== null) {
            const card = game.playerHand[game.selectedHandIndex];

            if (isValidMove(card, targetIndex, targetPile)) {
                game.playerHand.splice(game.selectedHandIndex, 1);
                game.piles[targetIndex] = [...game.piles[targetIndex], card];
                game.playerHand = [...game.playerHand];
                game.piles = [...game.piles];
                game.selectedHandIndex = null;
                game.statusMessage = `Played ${getRankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]} to ${PILE_NAMES[targetIndex]}.`;
            } else {
                game.statusMessage = 'Invalid move.';
            }
            saveGame();
            return;
        }

        if (game.selectedPileIndex === null) {
            if (game.piles[targetIndex].length > 0) {
                game.selectedPileIndex = targetIndex;
            }
            return;
        }

        if (game.selectedPileIndex !== targetIndex) {
            const sourcePile = game.piles[game.selectedPileIndex];
            if (sourcePile.length === 0) return;

            const bottomCardOfSource = sourcePile[0];

            if (isValidMove(bottomCardOfSource, targetIndex, targetPile)) {
                game.piles[targetIndex] = [
                    ...game.piles[targetIndex],
                    ...sourcePile,
                ];
                game.piles[game.selectedPileIndex] = [];
                game.piles = [...game.piles];
                game.statusMessage = `Moved stack from ${PILE_NAMES[game.selectedPileIndex]} to ${PILE_NAMES[targetIndex]}.`;
            } else {
                game.statusMessage = 'Invalid stack move.';
            }

            game.selectedPileIndex = null;
            saveGame();
            return;
        }

        game.selectedPileIndex = null;
    }

    function endTurn() {
        if (game.currentTurn !== 'player' || !game.hasDrawnCard) return;

        game.selectedHandIndex = null;
        game.selectedPileIndex = null;
        game.currentTurn = 'computer';
        game.statusMessage = "Computer's turn...";
        game.cpuHighlight = null;
        saveGame();

        setTimeout(runComputerTurn, 400);
    }

    function runComputerTurn() {
        if (isGameOver) return;

        const before = game.piles.map((pile) => pile.length);

        const nextState = resolveComputerTurn({
            deck: game.deck,
            computerHand: game.computerHand,
            piles: game.piles,
        });

        game.deck = nextState.deck;
        game.computerHand = nextState.computerHand;
        game.piles = nextState.piles;
        game.currentTurn = 'player';
        game.hasDrawnCard = false;
        game.statusMessage = 'Your turn. Draw a card to begin.';

        const changedIndex = before.findIndex(
            (length, index) => length !== game.piles[index].length,
        );
        game.cpuHighlight = changedIndex >= 0 ? changedIndex : null;

        setTimeout(() => {
            game.cpuHighlight = null;
        }, 280);

        saveGame();
    }
</script>

<main class="mx-auto max-w-4xl p-4 font-mono text-xs sm:text-sm select-none">
    {#if isGameOver}
        <div class="mb-4 p-3 bg-neutral-900 text-white font-bold text-center">
            Game Over! Winner: {winner}
        </div>
    {/if}

    <!-- Board Grid -->
    <div class="mx-auto mb-6 max-w-lg">
        <div class="grid grid-cols-3 bg-neutral-100">
            <div
                class="flex items-center justify-center border-r-[2px] border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="NW Corner"
                    pile={game.piles[4]}
                    selected={game.selectedPileIndex === 4}
                    variant="corner"
                    onSelect={() => handlePileClick(4)}
                    highlight={game.cpuHighlight === 4}
                />
            </div>
            <div
                class="flex items-center justify-center border-r-[2px] border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="North"
                    pile={game.piles[0]}
                    selected={game.selectedPileIndex === 0}
                    onSelect={() => handlePileClick(0)}
                    highlight={game.cpuHighlight === 0}
                />
            </div>
            <div
                class="flex items-center justify-center border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="NE Corner"
                    pile={game.piles[5]}
                    selected={game.selectedPileIndex === 5}
                    variant="corner"
                    onSelect={() => handlePileClick(5)}
                    highlight={game.cpuHighlight === 5}
                />
            </div>

            <div
                class="flex items-center justify-center border-r-[2px] border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="West"
                    pile={game.piles[3]}
                    selected={game.selectedPileIndex === 3}
                    onSelect={() => handlePileClick(3)}
                    highlight={game.cpuHighlight === 3}
                />
            </div>
            <div
                class="flex items-center justify-center border-r-[2px] border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <div
                    class="stock-slot bg-dither relative flex h-32 w-22 items-center justify-center"
                >
                    <span
                        class="rounded-sm bg-white px-1 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-950"
                    >
                        STOCK
                    </span>
                    <span
                        class="absolute bottom-1 rounded-sm bg-white px-1 py-0.5 text-[8px] font-bold text-neutral-900"
                    >
                        Stock Left: {game.deck.length}
                    </span>
                </div>
            </div>
            <div
                class="flex items-center justify-center border-b-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="East"
                    pile={game.piles[1]}
                    selected={game.selectedPileIndex === 1}
                    onSelect={() => handlePileClick(1)}
                    highlight={game.cpuHighlight === 1}
                />
            </div>

            <div
                class="flex items-center justify-center border-r-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="SW Corner"
                    pile={game.piles[7]}
                    selected={game.selectedPileIndex === 7}
                    variant="corner"
                    onSelect={() => handlePileClick(7)}
                    highlight={game.cpuHighlight === 7}
                />
            </div>
            <div
                class="flex items-center justify-center border-r-[2px] border-neutral-800 bg-neutral-100 p-2"
            >
                <PileSlot
                    label="South"
                    pile={game.piles[2]}
                    selected={game.selectedPileIndex === 2}
                    onSelect={() => handlePileClick(2)}
                    highlight={game.cpuHighlight === 2}
                />
            </div>
            <div class="flex items-center justify-center bg-neutral-100 p-2">
                <PileSlot
                    label="SE Corner"
                    pile={game.piles[6]}
                    selected={game.selectedPileIndex === 6}
                    variant="corner"
                    onSelect={() => handlePileClick(6)}
                    highlight={game.cpuHighlight === 6}
                />
            </div>
        </div>
    </div>

    <section
        class="mb-4 flex min-h-12 items-center gap-2 justify-between border border-neutral-200 bg-neutral-100 p-2"
    >
        <span class="flex-1 min-w-0">{game.statusMessage}</span>
        <div
            class="flex min-h-8 items-center gap-2 transition-opacity
        {game.currentTurn !== 'player' || isGameOver
                ? 'opacity-0 pointer-events-none'
                : ''}"
        >
            <button
                disabled={game.currentTurn !== 'player' ||
                    game.hasDrawnCard ||
                    game.deck.length === 0 ||
                    isGameOver}
                onclick={drawCard}
                class="px-3 py-1 bg-neutral-800 text-white disabled:opacity-40"
            >
                Draw Card
            </button>
            <button
                disabled={game.currentTurn !== 'player' ||
                    !game.hasDrawnCard ||
                    isGameOver}
                onclick={endTurn}
                class="px-3 py-1 border border-neutral-800 disabled:opacity-40"
            >
                End Turn
            </button>
        </div>
    </section>

    <!-- Hand Area -->
    <section class="border-t border-neutral-300 pt-3">
        <h2 class="font-bold mb-2">
            Your Hand ({game.playerHand.length} cards)
        </h2>
        <div class="flex flex-wrap gap-2">
            {#each game.playerHand as card, idx}
                <HandCard
                    {card}
                    selected={game.selectedHandIndex === idx}
                    onSelect={() => handleHandCardClick(idx)}
                />
            {/each}
        </div>
    </section>
</main>
