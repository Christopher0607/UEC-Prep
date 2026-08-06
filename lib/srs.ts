import type { Card } from "./types";

/**
 * Leitner boxes. Deliberately simpler than SM-2: with 11 weeks left there is no
 * time for a scheduler to "settle in", and box 6 already lands past the exam.
 */
export const INTERVALS = [0, 1, 2, 4, 8, 16, 32] as const;
export const MAX_BOX = INTERVALS.length - 1;

function addDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function schedule(card: Card, remembered: boolean): Card {
  // A lapse goes back to box 0, not box-1. If you forgot it, you did not
  // half-remember it, and a card you keep forgetting deserves the full ladder.
  const box = remembered ? Math.min(card.box + 1, MAX_BOX) : 0;
  return {
    ...card,
    box,
    lapses: remembered ? card.lapses : card.lapses + 1,
    dueAt: addDays(INTERVALS[box]),
  };
}

export function isDue(card: Card, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

export function dueCards(cards: Card[], now: Date = new Date()): Card[] {
  // Weakest first: cards you have lapsed on most are the ones that decide grades.
  return cards
    .filter((c) => isDue(c, now))
    .sort((a, b) => b.lapses - a.lapses || a.box - b.box);
}
