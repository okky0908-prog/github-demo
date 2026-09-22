output "instance_id" {
  description = "作成したEC2インスタンスのID"
  value       = aws_instance.this.id
}

output "public_ip" {
  description = "作成したEC2インスタンスのパブリックIPアドレス"
  value       = aws_instance.this.public_ip
}

output "ssh_command" {
  description = "SSH接続コマンドの例"
  value       = "ssh -i ~/.ssh/github-demo-aws-ec2 ec2-user@${aws_instance.this.public_ip}"
}

output "rds_endpoint" {
  description = "RDSのエンドポイント（ホスト名:ポート）。EC2からのみ接続可能"
  value       = aws_db_instance.this.endpoint
}

output "db_name" {
  description = "RDSのデータベース名"
  value       = aws_db_instance.this.db_name
}

output "db_username" {
  description = "RDSの管理者ユーザー名"
  value       = aws_db_instance.this.username
  sensitive   = true
}
