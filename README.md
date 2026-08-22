# Trello風タスク管理アプリ

個人利用を目的とした、Trello風のシンプルなタスク管理Webアプリケーション。スクール課題として、要件定義〜設計〜実装を一人で経験することを主目的に開発している。

想定利用者は開発者本人のみ（1ユーザー）で、ログイン・認証機能は持たない。詳細は[要件定義書](docs/requirements.md)を参照。

## 主な機能（MVP）

- ボード・リスト・カードの3階層によるタスク管理（ボードは1つのみ）
- リスト・カードの作成／編集／削除
- カードのドラッグ&ドロップ（リスト間移動、リスト内並び替え）※実装予定
- バックエンドAPI・PostgreSQLによるデータ永続化（ブラウザを閉じてもデータが残る）

詳細は[機能要件](docs/features.md)・[画面仕様・画面遷移・ユースケース](docs/screens.md)を参照。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript 7 + Vite 8 |
| バックエンド | Java 25 + Spring Boot 4.1 (Gradle Kotlin DSL) |
| データベース | PostgreSQL 17（Spring Data JPA + Flyway） |
| ローカル環境 | Docker Compose（PostgreSQLコンテナ） |

各コンポーネントの詳細バージョン・採用理由は[技術スタック](docs/tech-stack.md)を参照。

## ディレクトリ構成

```
.
├── backend/    # Spring Boot バックエンド（REST API）
├── frontend/   # React + Vite フロントエンド（SPA）
├── docs/       # 要件定義・設計ドキュメント
├── mockup/     # 実装前に作成した静的HTML/CSS/JSモックアップ
└── docker-compose.yml   # ローカルPostgreSQL起動用
```

## セットアップ・起動方法

固定ポート（`backend: 8080` / `frontend: 5173` / `postgres: 5432`）で起動する。ポート競合時の対処など詳細な手順は[.claude/skills/run/SKILL.md](.claude/skills/run/SKILL.md)を参照。

### 前提条件

- Java 25（例：`brew install openjdk@25`。keg-onlyのため`JAVA_HOME`の指定が必要）
- Node.js 24系（`frontend/.nvmrc`）
- Docker（Docker Compose）

### 1. 環境変数ファイルを用意する

```bash
cp .env.example .env
```

### 2. PostgreSQLを起動する

```bash
docker compose up -d postgres
```

### 3. バックエンドを起動する（別ターミナル）

```bash
cd backend
JAVA_HOME=$(brew --prefix openjdk@25)/libexec/openjdk.jdk/Contents/Home ./gradlew bootRun
```

起動確認：`curl -sf http://localhost:8080/actuator/health`

### 4. フロントエンドを起動する（別ターミナル）

```bash
cd frontend
npm install
npm run dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開く。

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義書](docs/requirements.md) | 背景・目的・スコープ・要件全体のサマリ |
| [機能要件](docs/features.md) | ボード・リスト・カードの機能仕様 |
| [画面仕様・画面遷移・ユースケース](docs/screens.md) | 画面構成・操作フロー |
| [データ構造・ER図](docs/database.md) | Board/List/Cardのデータモデル |
| [非機能要件](docs/non-functional-requirements.md) | 性能・可用性・セキュリティ等 |
| [技術スタック](docs/tech-stack.md) | 採用技術とバージョン、選定理由 |
| [モックアップ実装計画書](docs/mockup-plan.md) | 本実装前に作成した静的モックアップの内容 |

## 現在の進捗状況

- [x] 要件定義・画面仕様・データ構造・非機能要件・技術スタックのドキュメント整備
- [x] 静的HTML/CSS/JSによるモックアップ作成（`mockup/`）
- [x] Spring Bootバックエンドの雛形、Docker ComposeによるローカルPostgreSQL接続
- [x] Board/List/CardのFlywayマイグレーション・JPAエンティティ
- [x] カード（タスク）読み取りAPI
- [x] フロントエンド環境構築、ボード画面（READ専用）実装
- [ ] リスト・カードの作成／編集／削除API・画面
- [ ] ドラッグ&ドロップ（リスト間移動・並び替え）

## 開発ルール

Issue作成 → ブランチ作成 → コミット → PR作成の運用ルールは[CLAUDE.md](CLAUDE.md)を参照。
