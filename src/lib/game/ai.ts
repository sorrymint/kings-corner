import { isValidMove } from './logic';
import type { BoardState } from './types';

export function resolveComputerTurn(board: BoardState): BoardState {
    const deck = [...board.deck];
    const computerHand = [...board.computerHand];
    const piles = board.piles.map((pile) => [...pile]);

    if (deck.length > 0) {
        computerHand.push(deck.pop()!);
    }

    let madeMove = true;
    let turnSafetyCounter = 0;

    while (madeMove && turnSafetyCounter < 25) {
        turnSafetyCounter += 1;
        madeMove = false;

        for (let src = 0; src < 4; src++) {
            if (piles[src].length > 0 && piles[src][0].rank === 13) {
                for (let dest = 4; dest < 8; dest++) {
                    if (piles[dest].length === 0) {
                        piles[dest] = [...piles[src]];
                        piles[src] = [];
                        madeMove = true;
                        break;
                    }
                }
            }
            if (madeMove) break;
        }
        if (madeMove) continue;

        for (let i = 0; i < computerHand.length; i++) {
            const card = computerHand[i];
            for (let pileIndex = 0; pileIndex < 8; pileIndex++) {
                if (isValidMove(card, pileIndex, piles[pileIndex])) {
                    const [playedCard] = computerHand.splice(i, 1);
                    piles[pileIndex] = [...piles[pileIndex], playedCard];
                    madeMove = true;
                    break;
                }
            }
            if (madeMove) break;
        }
        if (madeMove) continue;

        for (let src = 0; src < 8; src++) {
            if (piles[src].length === 0) continue;
            const bottomCard = piles[src][0];

            for (let dest = 0; dest < 8; dest++) {
                if (src === dest || piles[dest].length === 0) continue;
                if (isValidMove(bottomCard, dest, piles[dest])) {
                    piles[dest] = [...piles[dest], ...piles[src]];
                    piles[src] = [];
                    madeMove = true;
                    break;
                }
            }
            if (madeMove) break;
        }
    }

    return { deck, computerHand, piles };
}
