# 技術スタック

[要件定義書](./requirements.md) の詳細ドキュメント。Trello風タスク管理アプリの技術スタックをまとめる。

## フロントエンド

- フレームワーク：React + TypeScript
- ビルド・開発環境：Vite
- 状態管理：React標準の useState / useContext 等で対応する（本アプリの規模では外部状態管理ライブラリは不要と判断）
- サーバー通信：標準の fetch APIを直接利用する（本アプリの規模ではReact Query等のデータ取得ライブラリは不要と判断。バックエンドは後述のREST APIを利用する）
- ドラッグ&ドロップ：dnd-kit（@dnd-kit/core）を採用
  - 理由：旧来よく使われた react-beautiful-dnd はメンテナンス終了しているため非推奨。dnd-kitは軽量かつ活発にメンテナンスされており、最新のReactにも対応している
- スタイリング：CSS Modules など、追加ライブラリに依存しないシンプルな手段を想定（詳細は設計フェーズで決定）
- ※ Next.jsは今回は対象外（SSR/SSG等が不要な単一ページ構成のため、素のReact + Viteで十分と判断）

## バックエンド

- 言語：Java（LTSバージョンを使用。2026年時点の最新LTSはJava 25）
- フレームワーク：Spring Boot（3.x系）
- ビルドツール：Gradle（Kotlin DSL）
  - 理由：Mavenと並ぶ標準的な選択肢。差分ビルドによりビルドが高速で、近年のSpring Boot新規プロジェクトでの採用例も多い
- Web／API：Spring Web（spring-boot-starter-web）でRESTful API（JSON）を提供する
- バリデーション：Spring Validation（Bean Validation／Hibernate Validator）でリクエストの入力検証を行う
- テスト：JUnit 5 + Spring Boot Test（MockMvcによるAPIレベルのテスト）

## データベース・永続化

- DBエンジン：PostgreSQL
  - 理由：OSSで実績が豊富。UUID型やJSON型など[データ構造・ER図](./database.md)で使う型を標準サポートしており、Spring Bootとの組み合わせ事例も多い
- ORM／DBアクセス：Spring Data JPA（Hibernate）
  - 理由：Spring Bootとの親和性が高く、[データ構造・ER図](./database.md)のBoard/List/Cardのようなシンプルな階層構造であれば、リポジトリインターフェースの実装だけで基本的なCRUDが完結する
- マイグレーション管理：Flyway
  - 理由：Spring Bootに組み込みサポートがあり、SQLベースでスキーマ変更履歴を管理できるため、個人開発でも運用がシンプル

## ローカル開発環境

- DB起動：Docker（Docker Compose）でPostgreSQLコンテナをローカルに起動する
  - 理由：個人のローカル環境（[非機能要件](./non-functional-requirements.md)）でホストを汚さずにDBを用意でき、バージョン管理もしやすい
