variable "aws_region" {
  description = "リソースを作成するAWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名のプレフィックス"
  type        = string
  default     = "github-demo"
}

variable "instance_type" {
  description = "EC2インスタンスタイプ（無料利用枠対象: t2.micro / t3.micro）"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key" {
  description = "EC2にSSH接続するための公開鍵の中身（例: ~/.ssh/github-demo-aws-ec2.pub の内容）"
  type        = string
}

variable "my_ip_cidr" {
  description = "自分のPCからのアクセスのみを許可する送信元IP（SSH:22番・HTTP:80番の両方に適用。例: 自分のグローバルIP/32）"
  type        = string
}
