export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Color = 'red' | 'black';
export type Turn = 'player' | 'computer';

export interface Card {
    id: string;
    suit: Suit;
    rank: number;
    color: Color;
}

export interface BoardState {
    deck: Card[];
    computerHand: Card[];
    piles: Card[][];
}
