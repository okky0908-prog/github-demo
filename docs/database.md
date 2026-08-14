# データ構造・ER図

[要件定義書](./requirements.md) の詳細ドキュメント。Trello風タスク管理アプリのデータ構造をまとめる。

## 概念構造（参考）

```mermaid
flowchart TD
    Board -->|1:N| List
    List -->|1:N| Card
```

## ER図

- 今回はボードは1つのみ運用するが、将来の複数ボード対応（[要件定義書](./requirements.md) 4.2）を見据え、Boardを起点とした構造としておく

```mermaid
erDiagram
    BOARD ||--o{ LIST : contains
    LIST ||--o{ CARD : contains

    BOARD {
        uuid id PK
        string name
        timestamp created_at
        timestamp updated_at
    }
    LIST {
        uuid id PK
        uuid board_id FK
        string title
        int position
        timestamp created_at
        timestamp updated_at
    }
    CARD {
        uuid id PK
        uuid list_id FK
        string title
        text description
        string priority
        date due_date
        int position
        timestamp created_at
        timestamp updated_at
    }
```

- `position` はリスト内・ボード内での並び順を保持するための整数値（ドラッグ&ドロップの並び替え結果を反映する）
- 認証機能を持たないため、User等のエンティティは設けない
