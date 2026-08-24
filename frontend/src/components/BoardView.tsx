import { useState } from 'react'
import { useBoardData } from '../hooks/useBoardData'
import type { CardDto } from '../api/types'
import { CardEditModal } from './CardEditModal'
import { ListColumn } from './ListColumn'
import styles from './BoardView.module.css'

export function BoardView() {
  const { state, addCard, editCard } = useBoardData()
  const [editingCard, setEditingCard] = useState<CardDto | null>(null)

  if (state.status === 'loading') {
    return <div className={styles.status}>読み込み中...</div>
  }

  if (state.status === 'error') {
    return <div className={styles.status}>データの取得に失敗しました：{state.message}</div>
  }

  return (
    <div className={styles.board}>
      {state.lists.map((list) => (
        <ListColumn
          key={list.id}
          list={list}
          cards={state.cardsByListId.get(list.id) ?? []}
          onAddCard={addCard}
          onCardClick={setEditingCard}
        />
      ))}
      {editingCard && (
        <CardEditModal card={editingCard} onSave={editCard} onClose={() => setEditingCard(null)} />
      )}
    </div>
  )
}
