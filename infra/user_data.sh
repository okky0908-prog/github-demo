#!/bin/bash
set -eux

dnf install -y nginx java-25-amazon-corretto

# JVM起動時のメモリ不足に対する安全弁（1GBのスワップファイル、永続化）
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# nginx: 静的ファイル配信 + /api を backend(127.0.0.1:8080)へリバースプロキシ
# (nginx.conf本体は編集しない。conf.d側でdefault_serverを明示すれば
#  パッケージ更新で上書きされるリスクなく安全に共存できる)
cat > /etc/nginx/conf.d/app.conf << 'EOF'
server {
    listen       80 default_server;
    listen       [::]:80 default_server;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
EOF

mkdir -p /opt/trello
chown ec2-user:ec2-user /opt/trello

cat > /etc/systemd/system/trello-backend.service << 'EOF'
[Unit]
Description=Trello backend (Spring Boot)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/trello
EnvironmentFile=/opt/trello/backend.env
ExecStart=/usr/bin/java -Xms96m -Xmx192m -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=64m -Xss512k -XX:+UseSerialGC -Dserver.address=127.0.0.1 -Dserver.tomcat.threads.max=10 -jar /opt/trello/backend.jar
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# jar/envはまだ存在しないためenableのみ（起動はdeploy.shが行う）
systemctl daemon-reload
systemctl enable trello-backend

systemctl restart nginx
