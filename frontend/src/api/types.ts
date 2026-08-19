export type Priority = 'HIGH' | 'MID' | 'LOW'

export interface BoardDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ListDto {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface CardDto {
  id: string
  listId: string
  title: string
  description: string | null
  priority: Priority | null
  dueDate: string | null
  position: number
  createdAt: string
  updatedAt: string
}
