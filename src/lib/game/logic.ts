import type { BoardState, Card, Color, Suit } from './types';

export const SUIT_SYMBOLS: Record<Suit, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
};

export const PILE_NAMES = [
    'North',
    'East',
    'South',
    'West',
    'NW Corner',
    'NE Corner',
    'SE Corner',
    'SW Corner',
] as const;

export function getRankLabel(rank: number): string {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
}

export function createDeck(): Card[] {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const cards: Card[] = [];

    for (const suit of suits) {
        const color: Color =
            suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
        for (let rank = 1; rank <= 13; rank++) {
            cards.push({ id: `${suit}-${rank}`, suit, rank, color });
        }
    }

    return cards.sort(() => Math.random() - 0.5);
}

export function isValidMove(
    card: Card,
    targetPileIndex: number,
    targetPile: Card[],
): boolean {
    const isCorner = targetPileIndex >= 4;

    if (targetPile.length === 0) {
        return isCorner ? card.rank === 13 : true;
    }

    const topCard = targetPile[targetPile.length - 1];
    return card.rank === topCard.rank - 1 && card.color !== topCard.color;
}

export function createStartingBoard(): BoardState & { playerHand: Card[] } {
    const deck = createDeck();
    const playerHand = deck.splice(0, 7);
    const computerHand = deck.splice(0, 7);
    const piles: Card[][] = Array.from({ length: 8 }, () => []);

    for (let i = 0; i < 4; i++) {
        piles[i] = [deck.pop()!];
    }

    return { deck, playerHand, computerHand, piles };
}
