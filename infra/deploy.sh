#!/bin/bash
# ローカル(Mac)でフロントエンド・バックエンドをビルドし、EC2にデプロイするスクリプト。
# Terraformの一部ではない。`terraform apply`でEC2/RDSが起動済みであることが前提。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INFRA_DIR="${SCRIPT_DIR}"
SSH_KEY="${HOME}/.ssh/github-demo-aws-ec2"

echo "==> Terraformの出力値を取得"
EC2_IP="$(terraform -chdir="${INFRA_DIR}" output -raw public_ip)"
RDS_ENDPOINT="$(terraform -chdir="${INFRA_DIR}" output -raw rds_endpoint)"
DB_NAME="$(terraform -chdir="${INFRA_DIR}" output -raw db_name)"
DB_USERNAME="$(terraform -chdir="${INFRA_DIR}" output -raw db_username)"
DB_HOST="${RDS_ENDPOINT%%:*}"
DB_PORT="${RDS_ENDPOINT##*:}"
DB_PASSWORD="$(grep '^db_password' "${INFRA_DIR}/terraform.tfvars" | sed -E 's/^db_password[[:space:]]*=[[:space:]]*"(.*)"$/\1/')"

if [ -z "${EC2_IP}" ] || [ -z "${DB_PASSWORD}" ]; then
  echo "EC2のIPまたはDBパスワードが取得できませんでした。terraform applyが完了しているか確認してください。" >&2
  exit 1
fi

SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 ec2-user@${EC2_IP}"
SCP="scp -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new"

echo "==> バックエンドをビルド (./gradlew bootJar)"
(cd "${REPO_ROOT}/backend" && ./gradlew bootJar)
BACKEND_JAR="${REPO_ROOT}/backend/build/libs/backend-0.0.1-SNAPSHOT.jar"
if [ ! -f "${BACKEND_JAR}" ]; then
  echo "jarが見つかりません: ${BACKEND_JAR}" >&2
  exit 1
fi

echo "==> フロントエンドをビルド (npm ci && npm run build)"
(cd "${REPO_ROOT}/frontend" && npm ci && npm run build)
FRONTEND_DIST="${REPO_ROOT}/frontend/dist"

echo "==> フロントエンドをEC2へ配置"
${SSH} "rm -rf ~/deploy-frontend && mkdir -p ~/deploy-frontend"
${SCP} -r "${FRONTEND_DIST}/." "ec2-user@${EC2_IP}:~/deploy-frontend/"
${SSH} "sudo rm -rf /usr/share/nginx/html/* && sudo cp -r ~/deploy-frontend/* /usr/share/nginx/html/ && rm -rf ~/deploy-frontend"

echo "==> バックエンドのjarをEC2へ配置"
${SCP} "${BACKEND_JAR}" "ec2-user@${EC2_IP}:/opt/trello/backend.jar"

echo "==> RDS接続情報(backend.env)をEC2へ配置"
${SSH} "cat > /opt/trello/backend.env" << EOF
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USERNAME}
POSTGRES_PASSWORD=${DB_PASSWORD}
EOF
${SSH} "chmod 600 /opt/trello/backend.env"

echo "==> バックエンドを再起動"
${SSH} "sudo systemctl restart trello-backend"

echo "==> 起動待ち"
sleep 5

echo "==> 動作確認"
echo "--- フロントエンド ---"
curl -sS -m 10 -o /dev/null -w "HTTPステータス: %{http_code}\n" "http://${EC2_IP}/"
echo "--- バックエンド(/api/cards) ---"
curl -sS -m 10 "http://${EC2_IP}/api/cards" | head -c 500
echo
echo "==> 完了: http://${EC2_IP}/"
