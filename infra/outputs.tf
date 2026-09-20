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
