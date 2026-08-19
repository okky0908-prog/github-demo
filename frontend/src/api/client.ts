import type { BoardDto, CardDto, ListDto } from './types'

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`${path} が失敗しました (status: ${res.status})`)
  }
  return res.json() as Promise<T>
}

export function fetchBoards(): Promise<BoardDto[]> {
  return getJson('/api/boards')
}

export function fetchLists(boardId: string): Promise<ListDto[]> {
  return getJson(`/api/boards/${boardId}/lists`)
}

export function fetchCards(): Promise<CardDto[]> {
  return getJson('/api/cards')
}
