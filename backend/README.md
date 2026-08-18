# backend

Trello風タスク管理アプリのバックエンド（Java + Spring Boot）。
技術選定の詳細は [../docs/tech-stack.md](../docs/tech-stack.md) を参照。

## 現在のステータス

`application.yml` に `spring.datasource.*` を追加し、Docker ComposeでローカルPostgreSQLを起動できるようにした。`bootRun` の起動確認・`BackendApplicationTests`（`@SpringBootTest`）はいずれも有効化済み。

## ローカルDB（PostgreSQL）の起動

リポジトリルートで以下を実行する（初回のみ `.env` の作成が必要。既に `.env` があればそのまま2から）。

```
cp ../.env.example ../.env   # リポジトリルートで実行する場合は .env.example から .env をコピー
docker compose up -d
```

`docker compose ps` で `postgres` サービスが `healthy` になれば起動完了。停止する場合は `docker compose down`（データを保持するボリュームは残る）。

## 前提条件

- Java 25（Homebrewでインストール）
  ```
  brew install openjdk@25
  ```
  `openjdk@25` はkeg-onlyのため、システムのJavaとしては自動で認識されない。このプロジェクトをビルドする際は都度 `JAVA_HOME` を指定する。
  ```
  export JAVA_HOME=$(brew --prefix openjdk@25)/libexec/openjdk.jdk/Contents/Home
  ```
  毎回指定するのが面倒な場合は、上記exportを `~/.zshrc` 等に追加するか、下記コマンドでシステムに認識させる（要sudo）。
  ```
  sudo ln -sfn $(brew --prefix openjdk@25)/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-25.jdk
  ```

## ビルド

```
JAVA_HOME=$(brew --prefix openjdk@25)/libexec/openjdk.jdk/Contents/Home ./gradlew build
```

## 技術スタック（雛形に含まれるもの）

- Spring Boot 4.1.0 / Java 25 / Gradle（Kotlin DSL）
- Spring Web、Spring Data JPA、PostgreSQL Driver、Flyway、Spring Validation、Spring Boot Actuator
