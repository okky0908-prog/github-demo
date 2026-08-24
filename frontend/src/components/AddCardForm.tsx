import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateCardInput } from '../api/client'
import type { ListDto, Priority } from '../api/types'
import styles from './BoardView.module.css'

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: '優先度：未設定' },
  { value: 'HIGH', label: '優先度：高' },
  { value: 'MID', label: '優先度：中' },
  { value: 'LOW', label: '優先度：低' },
]

export function AddCardForm({
  lists,
  defaultListId,
  onAdd,
}: {
  lists: ListDto[]
  defaultListId: string
  onAdd: (listId: string, input: CreateCardInput) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [listId, setListId] = useState(defaultListId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetFields() {
    setTitle('')
    setDescription('')
    setPriority('')
    setDueDate('')
    setListId(defaultListId)
    setError(null)
  }

  function cancel() {
    setIsEditing(false)
    resetFields()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onAdd(listId, {
        title: trimmedTitle,
        description: description.trim() || null,
        priority: priority || null,
        dueDate: dueDate || null,
      })
      setIsEditing(false)
      resetFields()
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
      <textarea
        className={styles.addCardTextarea}
        placeholder="説明（任意）"
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={isSubmitting}
      />
      <select
        className={styles.addCardSelect}
        value={listId}
        onChange={(event) => setListId(event.target.value)}
        disabled={isSubmitting}
      >
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            ステータス：{list.title}
          </option>
        ))}
      </select>
      <div className={styles.addCardRow}>
        <select
          className={styles.addCardSelect}
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority | '')}
          disabled={isSubmitting}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={styles.addCardDate}
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={isSubmitting}
        />
      </div>
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
