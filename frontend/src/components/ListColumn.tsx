import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { CreateCardInput } from '../api/client'
import type { CardDto, ListDto } from '../api/types'
import type { SortMode } from '../lib/cardSort'
import { AddCardForm } from './AddCardForm'
import { SortableCard } from './SortableCard'
import styles from './BoardView.module.css'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'manual', label: '並び順：手動' },
  { value: 'priority', label: '並び順：優先度順' },
  { value: 'dueDate', label: '並び順：期限順' },
]

export function ListColumn({
  list,
  lists,
  cards,
  sortMode,
  onSortModeChange,
  onAddCard,
  onCardClick,
  onCardDelete,
}: {
  list: ListDto
  lists: ListDto[]
  cards: CardDto[]
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  onAddCard: (listId: string, input: CreateCardInput) => Promise<void>
  onCardClick: (card: CardDto) => void
  onCardDelete: (cardId: string) => void
}) {
  const { setNodeRef } = useDroppable({ id: list.id })

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <div className={styles.listTitle}>{list.title}</div>
        <select
          className={styles.sortSelect}
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value as SortMode)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles.cardList}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              onDelete={() => onCardDelete(card.id)}
            />
          ))}
        </div>
      </SortableContext>
      <AddCardForm lists={lists} defaultListId={list.id} onAdd={onAddCard} />
    </div>
  )
}
