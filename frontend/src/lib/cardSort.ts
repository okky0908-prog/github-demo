import type { CardDto, Priority } from '../api/types'

export type SortMode = 'manual' | 'priority' | 'dueDate'

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MID: 1, LOW: 2 }

export function sortCardsForDisplay(cards: CardDto[], mode: SortMode): CardDto[] {
  if (mode === 'manual') {
    return cards
  }

  const sorted = [...cards]

  if (mode === 'priority') {
    sorted.sort((a, b) => {
      const rankA = a.priority ? PRIORITY_RANK[a.priority] : 3
      const rankB = b.priority ? PRIORITY_RANK[b.priority] : 3
      return rankA - rankB
    })
  } else {
    sorted.sort((a, b) => {
      if (a.dueDate === b.dueDate) {
        return 0
      }
      if (a.dueDate === null) {
        return 1
      }
      if (b.dueDate === null) {
        return -1
      }
      return a.dueDate < b.dueDate ? -1 : 1
    })
  }

  return sorted
}
