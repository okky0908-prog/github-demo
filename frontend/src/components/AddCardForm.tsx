import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './BoardView.module.css'

export function AddCardForm({ onAdd }: { onAdd: (title: string) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function cancel() {
    setIsEditing(false)
    setTitle('')
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setTitle('')
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isEditing) {
    return (
      <button type="button" className={styles.addCardButton} onClick={() => setIsEditing(true)}>
        ＋カードを追加
      </button>
    )
  }

  return (
    <form className={styles.addCardForm} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.addCardInput}
        placeholder="カードのタイトルを入力"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        autoFocus
      />
      {error && <div className={styles.addCardError}>{error}</div>}
      <div className={styles.addCardActions}>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          追加
        </button>
        <button type="button" onClick={cancel} disabled={isSubmitting}>
          キャンセル
        </button>
      </div>
    </form>
  )
}
