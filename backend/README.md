# backend

Trello風タスク管理アプリのバックエンド（Java + Spring Boot）。
技術選定の詳細は [../docs/tech-stack.md](../docs/tech-stack.md) を参照。

## 現在のステータス

雛形段階。`./gradlew build`（コンパイル・パッケージング）は成功する状態だが、ローカルPostgreSQLが未セットアップのため以下は未実施：

- `./gradlew bootRun` でのアプリ起動確認
- `BackendApplicationTests`（`@SpringBootTest`によるコンテキスト起動確認。現在 `@Disabled`）

DBセットアップ後、`application.yml` に `spring.datasource.*` を追加し、上記2点を有効化する。

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
