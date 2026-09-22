---
name: terraform-review
description: このリポジトリのTerraformコード（infra/配下）に対する品質チェックを行う。セキュリティ（秘密情報の直書き・過剰な公開範囲）、コスト（無料利用枠・不要リソース）、保守性（fmt・命名・変数定義）、可用性（冪等性・依存関係）の観点でチェックし、結果を一覧で報告する。「Terraformの品質チェック」「infraのレビュー」等を求められたら使う。
---

# Terraformコード品質チェック

`infra/`配下のTerraformコード（`.tf`ファイル、`user_data.sh`、`deploy.sh`等の関連スクリプトを含む）を、以下の観点でチェックする。チェック結果は「問題なし／要修正」を明示し、要修正の項目は該当ファイル・行を示して報告する。

## 1. セキュリティ

- [ ] パスワード・APIキー等の秘密情報が`.tf`ファイルにハードコードされていないか（`variable`経由になっているか）
- [ ] 秘密情報を扱う`variable`に`sensitive = true`が付与されているか
- [ ] `terraform.tfvars`・`*.tfstate`・`*.tfstate.backup`・`.terraform/`が`.gitignore`されているか（stateには秘密情報が平文で残るため）
- [ ] セキュリティグループのingressが必要最小限か（`0.0.0.0/0`を使う場合、本当に全世界公開が必要なポートか。個人利用の管理用ポート（SSH等）は送信元IPやセキュリティグループで絞られているか）
- [ ] RDS等のデータストアが`publicly_accessible = false`等、インターネットから直接到達不可能になっているか
- [ ] IAMポリシーが最小権限になっているか（`Action: "*"`や無条件の`AdministratorAccess`相当を避け、必要なサービス・操作に絞られているか）

## 2. コスト管理

- [ ] インスタンスタイプ・DBインスタンスクラスが、想定しているコスト方針（無料利用枠等）に沿っているか
- [ ] Elastic IP等、未使用時にも課金され得るリソースを不要に作成していないか
- [ ] NAT Gateway・ALB等、コストの大きいマネージドサービスを、要件上不要なのに使っていないか
- [ ] `terraform destroy`が問題なく通る設定になっているか（`deletion_protection`・`skip_final_snapshot`等、学習用途で頻繁に作り直す前提と矛盾していないか）

## 3. 保守性・可読性

- [ ] `terraform fmt -check`が通るか（フォーマット崩れがないか）
- [ ] `terraform validate`が通るか
- [ ] すべての`variable`に`description`・`type`が設定されているか
- [ ] リソース名・タグの命名が一貫しているか（プレフィックス変数等で統一されているか、ハードコードされた名前が散在していないか）
- [ ] `required_providers`・`required_version`でバージョンが適切に固定・範囲指定されているか

## 4. 可用性・信頼性

- [ ] `user_data.sh`等の起動時スクリプトが冪等か（再実行・再作成されても安全か。例：スワップファイル作成前の存在チェック）
- [ ] リソース間の依存関係が正しく表現されているか（暗黙の参照 or 明示的な`depends_on`）
- [ ] 出力（`output`）に必要な情報が過不足なく定義されているか、秘密情報を含む出力に`sensitive = true`が付与されているか

## 実行手順

1. `terraform -chdir=infra fmt -check -diff` でフォーマット崩れを確認
2. `terraform -chdir=infra validate` で構文エラーを確認
3. 上記チェックリストに沿って`infra/*.tf`・`infra/user_data.sh`・`infra/deploy.sh`を目視レビュー
4. 見つかった問題は、重大度（セキュリティ > コスト > 保守性・可用性）の順に報告する
