---
name: run
description: このリポジトリ（Spring Boot バックエンド + Vite/React フロントエンド）の開発サーバーを起動する。ポート競合時は必ず占有プロセスを停止し、指定の固定ポートで起動し直す（別ポートへの退避は禁止）。
---

# アプリの起動手順

## 固定ポート（変更禁止）

| コンポーネント | ポート | 根拠 |
|---|---|---|
| PostgreSQL | `5432` | `.env` の `POSTGRES_PORT`（`docker-compose.yml`） |
| バックエンド（Spring Boot） | `8080` | `backend/src/main/resources/application.yml` に `server.port` の指定なし＝Spring Bootデフォルト |
| フロントエンド（Vite） | `5173` | `frontend/vite.config.ts` に `server.port` の指定なし＝Viteデフォルト |

## 起動コマンド

```bash
# 1. DB
docker compose up -d postgres

# 2. バックエンド（リポジトリルートから）
cd backend && ./gradlew bootRun

# 3. フロントエンド（別ターミナル、リポジトリルートから）
cd frontend && npm run dev
```

## ポート競合時の対応（必須ルール）

**空いている別のポートに逃がして起動することは禁止。** 必ず上記の固定ポートで起動できる状態にしてから起動すること。

1. 対象ポートを使っているプロセスを確認する

   ```bash
   lsof -ti tcp:8080   # バックエンド
   lsof -ti tcp:5173   # フロントエンド
   lsof -ti tcp:5432   # PostgreSQL
   ```

2. 見つかったプロセスがこのプロジェクトの古い起動プロセス（前回のセッションで停止し忘れたbootRun/viteなど）であれば停止する

   ```bash
   lsof -ti tcp:8080 | xargs kill
   ```

   - 停止対象がこのプロジェクトと無関係なプロセスに見える場合（PIDやプロセス名から判断がつかない、他の重要そうなサービスが動いている等）は、killする前に必ずユーザーに確認する。
   - `kill` で終了しない場合のみ `kill -9` を検討する。

3. ポートが空いたことを確認してから、同じ固定ポートで再度起動する。

## 起動確認

- バックエンド: `curl -sf http://localhost:8080/actuator/health` あるいは適当なREST APIエンドポイントへの疎通確認
- フロントエンド: `curl -sf http://localhost:5173` またはブラウザでアクセスして表示を確認
