import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useBoardData } from '../hooks/useBoardData'
import type { CardDto } from '../api/types'
import { Card } from './Card'
import { CardEditModal } from './CardEditModal'
import { ListColumn } from './ListColumn'
import styles from './BoardView.module.css'

export function BoardView() {
  const { state, addCard, editCard, moveCardLocally, persistCardPosition, changeCardList } = useBoardData()
  const [editingCard, setEditingCard] = useState<CardDto | null>(null)
  const [activeCard, setActiveCard] = useState<CardDto | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  if (state.status === 'loading') {
    return <div className={styles.status}>読み込み中...</div>
  }

  if (state.status === 'error') {
    return <div className={styles.status}>データの取得に失敗しました：{state.message}</div>
  }

  const board = state

  function findContainerId(id: string): string | undefined {
    if (board.lists.some((list) => list.id === id)) {
      return id
    }
    for (const [listId, cards] of board.cardsByListId) {
      if (cards.some((card) => card.id === id)) {
        return listId
      }
    }
    return undefined
  }

  function findCardById(cardId: string): CardDto | undefined {
    for (const cards of board.cardsByListId.values()) {
      const found = cards.find((card) => card.id === cardId)
      if (found) {
        return found
      }
    }
    return undefined
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveCard(findCardById(String(event.active.id)) ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) {
      return
    }
    const activeId = String(active.id)
    const overId = String(over.id)
    const sourceListId = findContainerId(activeId)
    const targetListId = findContainerId(overId)
    if (!sourceListId || !targetListId || sourceListId === targetListId) {
      return
    }

    const targetCards = board.cardsByListId.get(targetListId) ?? []
    const overIndex = targetCards.findIndex((card) => card.id === overId)
    moveCardLocally(activeId, targetListId, overIndex === -1 ? targetCards.length : overIndex)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) {
      return
    }
    const activeId = String(active.id)
    const overId = String(over.id)
    const targetListId = findContainerId(overId)
    if (!targetListId) {
      return
    }

    const targetCards = board.cardsByListId.get(targetListId) ?? []
    const overIndex = targetCards.findIndex((card) => card.id === overId)
    const finalIndex = overIndex === -1 ? targetCards.length : overIndex

    moveCardLocally(activeId, targetListId, finalIndex)
    persistCardPosition(activeId, targetListId, finalIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {board.lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            lists={board.lists}
            cards={board.cardsByListId.get(list.id) ?? []}
            onAddCard={addCard}
            onCardClick={setEditingCard}
          />
        ))}
      </div>
      <DragOverlay>{activeCard && <Card card={activeCard} onClick={() => {}} />}</DragOverlay>
      {editingCard && (
        <CardEditModal
          card={editingCard}
          lists={board.lists}
          onSave={editCard}
          onChangeList={changeCardList}
          onClose={() => setEditingCard(null)}
        />
      )}
    </DndContext>
  )
}
