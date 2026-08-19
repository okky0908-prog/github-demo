import type { CardDto, Priority } from '../api/types'
import styles from './Card.module.css'

const PRIORITY_LABEL: Record<Priority, string> = { HIGH: '高', MID: '中', LOW: '低' }
const PRIORITY_CLASS: Record<Priority, string> = {
  HIGH: styles.priorityHigh,
  MID: styles.priorityMid,
  LOW: styles.priorityLow,
}

function formatDueDate(dueDate: string): string {
  return `期限：${dueDate.replaceAll('-', '/')}`
}

export function Card({ card }: { card: CardDto }) {
  return (
    <div className={styles.card}>
      {card.priority && (
        <span className={`${styles.priorityBadge} ${PRIORITY_CLASS[card.priority]}`}>
          {PRIORITY_LABEL[card.priority]}
        </span>
      )}
      <div className={styles.title}>{card.title}</div>
      {card.dueDate && <div className={styles.dueDate}>{formatDueDate(card.dueDate)}</div>}
    </div>
  )
}
