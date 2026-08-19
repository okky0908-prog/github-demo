import type { CardDto, ListDto } from '../api/types'
import { Card } from './Card'
import styles from './BoardView.module.css'

export function ListColumn({ list, cards }: { list: ListDto; cards: CardDto[] }) {
  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{list.title}</div>
      <div className={styles.cardList}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
