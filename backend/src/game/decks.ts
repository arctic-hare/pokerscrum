export type DeckId =
  | 'standard'
  | 'short'
  | 'custom'
  | 'fibonacci'
  | 'modified_fibonacci'
  | 'tshirts'
  | 'powers_of_2';

export type CardDef = {
  id: string;
  label: string;
  numericValue?: number;
};

export const SPECIAL_CARD_IDS = {
  unknown: 'unknown',
  coffee: 'coffee',
} as const;

const specialCards: CardDef[] = [
  { id: SPECIAL_CARD_IDS.unknown, label: '?' },
  { id: SPECIAL_CARD_IDS.coffee, label: '☕' },
];

function numericCards(values: Array<number>, opts?: { includeSpecial?: boolean }): CardDef[] {
  const cards: CardDef[] = values.map((n) => ({
    id: String(n),
    label: String(n),
    numericValue: n,
  }));
  if (opts?.includeSpecial) {
    cards.push(...specialCards);
  }
  return cards;
}

export function getDeckCards(deckType: string, customDeck: string | null): CardDef[] {
  switch (deckType as DeckId) {
    case 'standard':
      return numericCards([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { includeSpecial: true });
    case 'short':
      return numericCards([1, 2, 3, 4, 5], { includeSpecial: true });
    case 'fibonacci':
      return numericCards([0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], { includeSpecial: true });
    case 'modified_fibonacci': {
      const cards: CardDef[] = [
        { id: '0', label: '0', numericValue: 0 },
        { id: '0.5', label: '½', numericValue: 0.5 },
        { id: '1', label: '1', numericValue: 1 },
        { id: '2', label: '2', numericValue: 2 },
        { id: '3', label: '3', numericValue: 3 },
        { id: '5', label: '5', numericValue: 5 },
        { id: '8', label: '8', numericValue: 8 },
        { id: '13', label: '13', numericValue: 13 },
        { id: '20', label: '20', numericValue: 20 },
        { id: '40', label: '40', numericValue: 40 },
        { id: '100', label: '100', numericValue: 100 },
        ...specialCards,
      ];
      return cards;
    }
    case 'tshirts':
      return [
        { id: 'XS', label: 'XS' },
        { id: 'S', label: 'S' },
        { id: 'M', label: 'M' },
        { id: 'L', label: 'L' },
        { id: 'XL', label: 'XL' },
        ...specialCards,
      ];
    case 'powers_of_2':
      return numericCards([0, 1, 2, 4, 8, 16, 32, 64], { includeSpecial: true });
    case 'custom': {
      if (!customDeck) return [];
      const ids = customDeck
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const uniqueIds = Array.from(new Set(ids));
      const cards: CardDef[] = uniqueIds.map((id) => ({
        id,
        label: id,
        numericValue: Number.isFinite(Number(id)) ? Number(id) : undefined,
      }));
      return [...cards, ...specialCards];
    }
    default:
      return numericCards([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { includeSpecial: true });
  }
}

export function isAverageEnabled(deckType: string): boolean {
  return (deckType as DeckId) !== 'tshirts';
}
