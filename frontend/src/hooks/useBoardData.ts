import { useEffect, useState } from 'react'
import { createCard, fetchBoards, fetchCards, fetchLists } from '../api/client'
import type { BoardDto, CardDto, ListDto } from '../api/types'

export type BoardDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; board: BoardDto; lists: ListDto[]; cardsByListId: Map<string, CardDto[]> }

function groupAndSortCards(lists: ListDto[], cards: CardDto[]): Map<string, CardDto[]> {
  const cardsByListId = new Map<string, CardDto[]>()
  for (const list of lists) {
    cardsByListId.set(list.id, [])
  }
  for (const card of cards) {
    cardsByListId.get(card.listId)?.push(card)
  }
  for (const listCards of cardsByListId.values()) {
    listCards.sort((a, b) => a.position - b.position)
  }
  return cardsByListId
}

export function useBoardData(): { state: BoardDataState; addCard: (listId: string, title: string) => Promise<void> } {
  const [state, setState] = useState<BoardDataState>({ status: 'loading' })

  async function addCard(listId: string, title: string) {
    const created = await createCard(listId, { title })
    setState((prev) => {
      if (prev.status !== 'ready') {
        return prev
      }
      const cardsByListId = new Map(prev.cardsByListId)
      cardsByListId.set(listId, [...(cardsByListId.get(listId) ?? []), created])
      return { ...prev, cardsByListId }
    })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const boards = await fetchBoards()
        const board = boards[0]
        if (!board) {
          throw new Error('ボードが登録されていません')
        }

        const [lists, cards] = await Promise.all([fetchLists(board.id), fetchCards()])
        const sortedLists = [...lists].sort((a, b) => a.position - b.position)

        if (!cancelled) {
          setState({
            status: 'ready',
            board,
            lists: sortedLists,
            cardsByListId: groupAndSortCards(sortedLists, cards),
          })
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : String(error)
          setState({ status: 'error', message })
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { state, addCard }
}
