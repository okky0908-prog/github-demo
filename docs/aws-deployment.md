# AWSデプロイ手順書：未経験者向けガイド

## Context

現時点の[非機能要件](./non-functional-requirements.md)は「開発者本人のローカル環境で動作させ、インターネットへ公開しない」ことを前提としている。本ドキュメントは、その方針を転換してAWS上に公開デプロイする際の手順・考え方を、AWS/Terraform/IaCが未経験であることを前提にまとめたものである。

**このドキュメントは計画・手順書であり、実際のTerraformコード・AWSリソースはまだ存在しない。** 実装は別Issue（Issue作成 → ブランチ → 作業 → PRの[運用ルール](../CLAUDE.md)に従う）で行う。

デプロイ方針は以下の通り決定済み：

- AWSマネジメントコンソールの手動操作ではなく、AWS CLI・Terraformを用いたコマンドラインベースで構築する
- 構成は**最小コスト構成**（EC2インスタンス1台上でDocker Composeによりフロントエンド・バックエンド・PostgreSQLをまとめて動かす）を採用する。ECS Fargate + RDS + ALB等の本格構成は今回は対象外とする
- AWSアカウントは既存のものを利用する（ルートユーザーでログイン可能な状態）

## 0. 前提知識

### IaC（Infrastructure as Code）とは

インフラ（サーバー・ネットワーク・DB等）をコードで定義し、コマンド一発で実際のクラウド上に構築する手法。AWSマネジメントコンソールでの手動操作と比較して、手順が再現可能になる、変更履歴が`git`で残る、`terraform plan`で変更内容を事前確認できる、といった利点がある。

### Terraformとは

HashiCorp社製のIaCツール。AWS専用のCloudFormationという選択肢もあるが、複数クラウド対応で学習リソースが豊富なTerraformを採用する。

| 用語 | 意味 |
|---|---|
| Provider | どのクラウドを操作するかの設定（今回は`aws`） |
| Resource | 作成したいリソースの単位（EC2インスタンス、セキュリティグループ等） |
| State（`.tfstate`） | 実際に存在するリソースの記録。Terraformはこれを見て差分を計算する。IPアドレス等の情報を含むため`.gitignore`対象とする |
| `terraform init` | Providerのダウンロード等、初期化 |
| `terraform plan` | 適用した場合の変更内容のシミュレーション（実際には何も変更しない） |
| `terraform apply` | 実際にAWS上にリソースを作成・変更する |
| `terraform destroy` | 作成したリソースを削除する（コスト管理上重要） |

## 1. AWS認証設定

### ルートユーザーとIAMユーザー

- **ルートユーザー**：アカウント作成時のメールアドレスでログインする最上位アカウント。日常作業には使わないのがベストプラクティス
- **IAMユーザー**：ルートユーザーが作成する作業用アカウント。必要な権限のみを付与する。Terraform・AWS CLIからの操作はこのIAMユーザーのアクセスキーを使う

流れ：**ルートユーザーで一度だけログイン → Terraform用IAMユーザーを作成 → そのアクセスキーでCLI/Terraformを動かす**。

### 手順

1. **ルートユーザーのMFA（多要素認証）を有効化**（未設定の場合）。IAM → セキュリティ認証情報 → MFAの割り当て。QRコードのスキャンが必要なため、この手順のみコンソールでの操作を推奨する
2. **Terraform専用のIAMユーザーを作成**。権限は以下のいずれか
   - **絞った権限（推奨）**：EC2・VPC・キーペア等、本構成に必要な範囲のみのカスタムポリシー
   - `AdministratorAccess`：全権限。権限エラーで詰まりにくいが、rootに近いリスクを持つ
3. **アクセスキーを発行し、`aws configure`で設定**（作業者自身の端末で実施。発行された鍵はAIエージェント等の第三者に直接渡さない）

   ```bash
   aws configure
   # AWS Access Key ID: (入力)
   # AWS Secret Access Key: (入力)
   # Default region name: ap-northeast-1
   # Default output format: json
   ```

4. **（推奨）予算アラートの設定**。Billing → Budgetsで月額予算超過時のメール通知を設定し、意図しない課金を防ぐ

## 2. 必要ツールのインストール（Mac / Homebrew）

```bash
brew install awscli
aws --version

brew install terraform
terraform -version
```

## 3. アーキテクチャ設計（最小コスト構成）

```
[ブラウザ] → (80番ポート) → [EC2インスタンス]
                                 ├─ nginx（静的ファイル配信 + /api を backend へリバースプロキシ）
                                 ├─ backend コンテナ（Spring Boot、8080番はコンテナ内のみ）
                                 └─ postgres コンテナ（5432番はコンテナ内のみ、外部非公開）
```

- **インスタンスタイプ**：`t3.micro`または`t4g.micro`（無料利用枠対象になり得るが、アカウントの無料枠状況は個別に要確認）
- **セキュリティグループ**：インバウンドは`80`（HTTP）と`22`（SSH、可能なら送信元IPを絞る）のみ許可。DBのポートは一切外部公開しない
- 本構成を実装する際は、[非機能要件](./non-functional-requirements.md)・[技術スタック](./tech-stack.md)の「ローカル環境限定・外部非公開」の記述もあわせて更新する

### Terraformで作成するリソース（想定）

- `aws_instance`（EC2本体）
- `aws_security_group`（ファイアウォール）
- `aws_key_pair`（SSH鍵）
- `aws_eip`（固定IP、任意）
- 必要に応じて`aws_vpc`関連（デフォルトVPCの流用も可）

## 4. Terraformコードの構成（想定）

```
infra/
├── main.tf           # provider設定、EC2・SG等のリソース定義
├── variables.tf       # リージョン・インスタンスタイプ等の変数
├── outputs.tf          # 作成後に表示するEC2のIPアドレス等
├── terraform.tfvars    # 実際の値（.gitignore対象）
└── user_data.sh         # EC2起動時に自動実行するスクリプト（Docker導入・アプリ起動）
```

- `.gitignore`に`*.tfstate`・`*.tfstate.backup`・`.terraform/`・`terraform.tfvars`を追加する（秘密情報・環境固有情報を含むため）
- stateは当面ローカル保存とし、S3バックエンドへの移行は必要になった時点で検討する

## 5. 実装時の作業の流れ

1. Terraform用IAMユーザーの作成・`aws configure`（作業者自身の環境で実施）
2. [CLAUDE.md](../CLAUDE.md)の運用ルールに従い、Issue作成 → `feat/xx-aws-terraform-deploy`等のブランチ作成
3. `infra/`配下にTerraformコードを作成
4. `terraform init` → `terraform plan`（差分確認） → `terraform apply`
5. 発行されたIPアドレスへのアクセスで動作確認
6. 問題なければPR作成 → マージ
7. 不要時は`terraform destroy`でリソースを削除し、課金停止を確認する

## 未決定事項

- Terraform用IAMユーザーの権限方針（絞った権限 or `AdministratorAccess`）
- AWS公開に伴う[非機能要件](./non-functional-requirements.md)・[技術スタック](./tech-stack.md)の更新タイミング（デプロイ実装と同時に行うか、別途行うか）
- Terraform stateのリモートバックエンド（S3）への移行要否
