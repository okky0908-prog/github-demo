import type { CardDto, ListDto } from '../api/types'
import { AddCardForm } from './AddCardForm'
import { Card } from './Card'
import styles from './BoardView.module.css'

export function ListColumn({
  list,
  cards,
  onAddCard,
}: {
  list: ListDto
  cards: CardDto[]
  onAddCard: (listId: string, title: string) => Promise<void>
}) {
  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{list.title}</div>
      <div className={styles.cardList}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <AddCardForm onAdd={(title) => onAddCard(list.id, title)} />
    </div>
  )
}
