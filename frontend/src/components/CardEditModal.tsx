import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UpdateCardInput } from '../api/client'
import type { CardDto, ListDto, Priority } from '../api/types'
import styles from './CardEditModal.module.css'

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: '優先度：未設定' },
  { value: 'HIGH', label: '優先度：高' },
  { value: 'MID', label: '優先度：中' },
  { value: 'LOW', label: '優先度：低' },
]

export function CardEditModal({
  card,
  lists,
  onSave,
  onChangeList,
  onClose,
}: {
  card: CardDto
  lists: ListDto[]
  onSave: (cardId: string, input: UpdateCardInput) => Promise<void>
  onChangeList: (cardId: string, targetListId: string) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [priority, setPriority] = useState<Priority | ''>(card.priority ?? '')
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [listId, setListId] = useState(card.listId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSave(card.id, {
        title: trimmedTitle,
        description: description.trim() || null,
        priority: priority || null,
        dueDate: dueDate || null,
      })
      if (listId !== card.listId) {
        await onChangeList(card.id, listId)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.heading}>カードを編集</h2>

        <label className={styles.label}>
          タイトル
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </label>

        <label className={styles.label}>
          説明
          <textarea
            className={styles.textarea}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className={styles.label}>
          ステータス
          <select
            className={styles.select}
            value={listId}
            onChange={(event) => setListId(event.target.value)}
            disabled={isSubmitting}
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            優先度
            <select
              className={styles.select}
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
          </label>

          <label className={styles.label}>
            期限
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="submit" disabled={isSubmitting || !title.trim()}>
            保存
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
