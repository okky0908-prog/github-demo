import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { CreateCardInput } from '../api/client'
import type { CardDto, ListDto } from '../api/types'
import { AddCardForm } from './AddCardForm'
import { SortableCard } from './SortableCard'
import styles from './BoardView.module.css'

export function ListColumn({
  list,
  lists,
  cards,
  onAddCard,
  onCardClick,
}: {
  list: ListDto
  lists: ListDto[]
  cards: CardDto[]
  onAddCard: (listId: string, input: CreateCardInput) => Promise<void>
  onCardClick: (card: CardDto) => void
}) {
  const { setNodeRef } = useDroppable({ id: list.id })

  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{list.title}</div>
      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles.cardList}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </div>
      </SortableContext>
      <AddCardForm lists={lists} defaultListId={list.id} onAdd={onAddCard} />
    </div>
  )
}
