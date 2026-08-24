import type { CreateCardInput } from '../api/client'
import type { CardDto, ListDto } from '../api/types'
import { AddCardForm } from './AddCardForm'
import { Card } from './Card'
import styles from './BoardView.module.css'

export function ListColumn({
  list,
  cards,
  onAddCard,
  onCardClick,
}: {
  list: ListDto
  cards: CardDto[]
  onAddCard: (listId: string, input: CreateCardInput) => Promise<void>
  onCardClick: (card: CardDto) => void
}) {
  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{list.title}</div>
      <div className={styles.cardList}>
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}
      </div>
      <AddCardForm onAdd={(input) => onAddCard(list.id, input)} />
    </div>
  )
}
