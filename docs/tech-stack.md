# 技術スタック

[要件定義書](./requirements.md) の詳細ドキュメント。Trello風タスク管理アプリの技術スタックをまとめる。

バージョンは実際に導入・動作確認済みのものを記載する（`frontend/package.json`・`backend/build.gradle.kts`・`docker-compose.yml`を参照。日付は最終確認日）。

## フロントエンド

- フレームワーク：React（19.2.8） + TypeScript（7.0.2）
- ビルド・開発環境：Vite（8.2.1、`@vitejs/plugin-react` 6.0.5）
- 実行環境：Node.js 24系（`frontend/.nvmrc`で固定）
- Lint：oxlint（1.79.0）
- 状態管理：React標準の useState / useContext 等で対応する（本アプリの規模では外部状態管理ライブラリは不要と判断）
- サーバー通信：標準の fetch APIを直接利用する（本アプリの規模ではReact Query等のデータ取得ライブラリは不要と判断。バックエンドは後述のREST APIを利用する）
- ドラッグ&ドロップ：dnd-kit（@dnd-kit/core）を採用予定（2026-08-22時点、ボード画面はREAD専用実装のため未導入。ドラッグ&ドロップ実装時に追加する）
  - 理由：旧来よく使われた react-beautiful-dnd はメンテナンス終了しているため非推奨。dnd-kitは軽量かつ活発にメンテナンスされており、最新のReactにも対応している
- スタイリング：CSS Modules など、追加ライブラリに依存しないシンプルな手段を想定（詳細は設計フェーズで決定）
- ※ Next.jsは今回は対象外（SSR/SSG等が不要な単一ページ構成のため、素のReact + Viteで十分と判断）

## バックエンド

- 言語：Java 25（25.0.4、Homebrew `openjdk@25`。2026年時点の最新LTS）
- フレームワーク：Spring Boot 4.1.0（内部のSpring Framework 7.0.8）
- ビルドツール：Gradle 9.5.1（Kotlin DSL）
  - 理由：Mavenと並ぶ標準的な選択肢。差分ビルドによりビルドが高速で、近年のSpring Boot新規プロジェクトでの採用例も多い
- Web／API：Spring Web（spring-boot-starter-webmvc、組み込みTomcat 11.0.22）でRESTful API（JSON）を提供する
- バリデーション：Spring Validation（Bean Validation／Hibernate Validator）でリクエストの入力検証を行う
- テスト：JUnit 5 + Spring Boot Test（MockMvcによるAPIレベルのテスト）

## データベース・永続化

- DBエンジン：PostgreSQL 17（Dockerイメージ`postgres:17`、動作確認時点のサーバーバージョンは17.11）
  - 理由：OSSで実績が豊富。UUID型やJSON型など[データ構造・ER図](./database.md)で使う型を標準サポートしており、Spring Bootとの組み合わせ事例も多い
- ORM／DBアクセス：Spring Data JPA（Hibernate ORM 7.4.1.Final）、PostgreSQL JDBCドライバ 42.7.11
  - 理由：Spring Bootとの親和性が高く、[データ構造・ER図](./database.md)のBoard/List/Cardのようなシンプルな階層構造であれば、リポジトリインターフェースの実装だけで基本的なCRUDが完結する
- マイグレーション管理：Flyway 12.4.0
  - 理由：Spring Bootに組み込みサポートがあり、SQLベースでスキーマ変更履歴を管理できるため、個人開発でも運用がシンプル

## ローカル開発環境

- DB起動：Docker（Docker Compose）でPostgreSQLコンテナをローカルに起動する
  - 理由：個人のローカル環境（[非機能要件](./non-functional-requirements.md)）でホストを汚さずにDBを用意でき、バージョン管理もしやすい
- 起動手順・固定ポートの詳細：[.claude/skills/run/SKILL.md](../.claude/skills/run/SKILL.md)を参照
