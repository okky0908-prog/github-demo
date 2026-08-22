import { useBoardData } from '../hooks/useBoardData'
import { ListColumn } from './ListColumn'
import styles from './BoardView.module.css'

export function BoardView() {
  const { state, addCard } = useBoardData()

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
        />
      ))}
    </div>
  )
}
