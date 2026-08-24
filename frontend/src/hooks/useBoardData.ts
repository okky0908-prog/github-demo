import { useEffect, useState } from 'react'
import { createCard, fetchBoards, fetchCards, fetchLists, moveCard as moveCardApi, updateCard } from '../api/client'
import type { CreateCardInput, UpdateCardInput } from '../api/client'
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

function reindexPositions(cards: CardDto[]): CardDto[] {
  return cards.map((card, index) => (card.position === index ? card : { ...card, position: index }))
}

export function useBoardData(): {
  state: BoardDataState
  addCard: (listId: string, input: CreateCardInput) => Promise<void>
  editCard: (cardId: string, input: UpdateCardInput) => Promise<void>
  moveCardLocally: (cardId: string, targetListId: string, targetIndex: number) => void
  persistCardPosition: (cardId: string, targetListId: string, targetIndex: number) => Promise<void>
  changeCardList: (cardId: string, targetListId: string) => Promise<void>
  commitSortedOrder: (targetListId: string, orderedCardIds: string[]) => Promise<void>
} {
  const [state, setState] = useState<BoardDataState>({ status: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)

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
  }, [reloadToken])

  async function addCard(listId: string, input: CreateCardInput) {
    const created = await createCard(listId, input)
    setState((prev) => {
      if (prev.status !== 'ready') {
        return prev
      }
      const cardsByListId = new Map(prev.cardsByListId)
      cardsByListId.set(listId, [...(cardsByListId.get(listId) ?? []), created])
      return { ...prev, cardsByListId }
    })
  }

  async function editCard(cardId: string, input: UpdateCardInput) {
    const updated = await updateCard(cardId, input)
    setState((prev) => {
      if (prev.status !== 'ready') {
        return prev
      }
      const cardsByListId = new Map(prev.cardsByListId)
      const listCards = cardsByListId.get(updated.listId)
      if (listCards) {
        cardsByListId.set(
          updated.listId,
          listCards.map((card) => (card.id === updated.id ? updated : card)),
        )
      }
      return { ...prev, cardsByListId }
    })
  }

  function moveCardLocally(cardId: string, targetListId: string, targetIndex: number) {
    setState((prev) => {
      if (prev.status !== 'ready') {
        return prev
      }

      let sourceListId: string | null = null
      let movingCard: CardDto | null = null
      for (const [listId, cards] of prev.cardsByListId) {
        const found = cards.find((card) => card.id === cardId)
        if (found) {
          sourceListId = listId
          movingCard = found
          break
        }
      }
      if (!movingCard || sourceListId === null) {
        return prev
      }

      const cardsByListId = new Map(prev.cardsByListId)
      const withoutMoved = (cardsByListId.get(sourceListId) ?? []).filter((card) => card.id !== cardId)

      if (sourceListId === targetListId) {
        const insertAt = Math.max(0, Math.min(targetIndex, withoutMoved.length))
        withoutMoved.splice(insertAt, 0, movingCard)
        cardsByListId.set(sourceListId, reindexPositions(withoutMoved))
      } else {
        cardsByListId.set(sourceListId, reindexPositions(withoutMoved))
        const targetCards = [...(cardsByListId.get(targetListId) ?? [])]
        const insertAt = Math.max(0, Math.min(targetIndex, targetCards.length))
        targetCards.splice(insertAt, 0, { ...movingCard, listId: targetListId })
        cardsByListId.set(targetListId, reindexPositions(targetCards))
      }

      return { ...prev, cardsByListId }
    })
  }

  async function persistCardPosition(cardId: string, targetListId: string, targetIndex: number) {
    try {
      await moveCardApi(cardId, targetListId, targetIndex)
    } catch {
      setReloadToken((token) => token + 1)
    }
  }

  async function changeCardList(cardId: string, targetListId: string) {
    const targetIndex = state.status === 'ready' ? (state.cardsByListId.get(targetListId)?.length ?? 0) : 0
    moveCardLocally(cardId, targetListId, targetIndex)
    await persistCardPosition(cardId, targetListId, targetIndex)
  }

  async function commitSortedOrder(targetListId: string, orderedCardIds: string[]) {
    setState((prev) => {
      if (prev.status !== 'ready') {
        return prev
      }

      let sourceListId: string | null = null
      let movingCard: CardDto | null = null
      for (const [listId, cards] of prev.cardsByListId) {
        if (listId === targetListId) {
          continue
        }
        const found = cards.find((card) => orderedCardIds.includes(card.id))
        if (found) {
          sourceListId = listId
          movingCard = found
          break
        }
      }

      const cardsByListId = new Map(prev.cardsByListId)

      if (movingCard && sourceListId) {
        const movedCardId = movingCard.id
        const remainingSource = (cardsByListId.get(sourceListId) ?? []).filter((card) => card.id !== movedCardId)
        cardsByListId.set(sourceListId, reindexPositions(remainingSource))
      }

      const cardById = new Map<string, CardDto>()
      for (const cards of cardsByListId.values()) {
        for (const card of cards) {
          cardById.set(card.id, card)
        }
      }
      if (movingCard) {
        cardById.set(movingCard.id, { ...movingCard, listId: targetListId })
      }

      const newTargetOrder = orderedCardIds
        .map((id) => cardById.get(id))
        .filter((card): card is CardDto => card !== undefined)
      cardsByListId.set(targetListId, reindexPositions(newTargetOrder))

      return { ...prev, cardsByListId }
    })

    try {
      for (let index = 0; index < orderedCardIds.length; index++) {
        await moveCardApi(orderedCardIds[index], targetListId, index)
      }
    } catch {
      setReloadToken((token) => token + 1)
    }
  }

  return {
    state,
    addCard,
    editCard,
    moveCardLocally,
    persistCardPosition,
    changeCardList,
    commitSortedOrder,
  }
}
