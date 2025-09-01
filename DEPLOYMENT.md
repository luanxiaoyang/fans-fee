# 🚀 部署指南

本文档提供了粉丝费用计算器的详细部署说明，包括开发环境、生产环境和Docker部署方案。

## 📋 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [域名配置](#域名配置)
- [SSL证书配置](#ssl证书配置)
- [故障排除](#故障排除)
- [性能优化](#性能优化)

## 🔧 环境要求

### 基础环境
- **Node.js**: 18.0+ (推荐 18.17.0 LTS)
- **npm**: 9.0+ 或 **yarn**: 1.22+
- **Git**: 2.30+

### 生产环境额外要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Nginx**: 1.20+ (如果不使用Docker)
- **SSL证书**: 用于HTTPS访问

### 系统要求
- **内存**: 最小 512MB，推荐 1GB+
- **磁盘**: 最小 100MB 可用空间
- **网络**: 开放端口 80, 443, 34145

## 💻 开发环境部署

### 1. 克隆项目
```bash
# 使用HTTPS
git clone https://github.com/your-username/fans-fee.git
cd fans-fee

# 或使用SSH
git clone git@github.com:your-username/fans-fee.git
cd fans-fee
```

### 2. 安装依赖
```bash
# 使用npm
npm install

# 或使用yarn
yarn install
```

### 3. 启动开发服务器
```bash
# 普通启动
npm start

# 开发模式（自动重启）
npm run dev

# 或使用yarn
yarn start
yarn dev
```

### 4. 访问应用
打开浏览器访问: `http://localhost:34145`

## 🌐 生产环境部署

### 方案一: 直接部署

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 部署应用
```bash
# 克隆项目
git clone https://github.com/your-username/fans-fee.git
cd fans-fee

# 安装依赖
npm ci --production

# 安装PM2进程管理器
npm install -g pm2

# 启动应用
pm2 start app.js --name "fans-fee"

# 设置开机自启
pm2 startup
pm2 save
```

#### 3. 配置Nginx反向代理
```bash
# 安装Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/fans-fee
```

添加以下配置:
```nginx
server {
    listen 80;
    server_name fee.sexychat.club;
    
    # HTTP重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fee.sexychat.club;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/fee.sexychat.club.crt;
    ssl_certificate_key /etc/nginx/ssl/fee.sexychat.club.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 反向代理到Node.js应用
    location / {
        proxy_pass http://localhost:34145;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/fans-fee /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 方案二: Docker部署（推荐）

## 🐳 Docker部署

### 1. 安装Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到docker组
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 部署应用
```bash
# 克隆项目
git clone https://github.com/your-username/fans-fee.git
cd fans-fee

# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. Docker命令参考
```bash
# 停止服务
docker-compose down

# 重新构建镜像
docker-compose build --no-cache

# 更新服务
docker-compose pull
docker-compose up -d

# 查看资源使用
docker stats

# 清理未使用的镜像
docker system prune -f
```

## 🌍 域名配置

### 1. DNS设置
在域名管理面板中添加以下记录:
```
类型: A
主机记录: @
记录值: 你的服务器IP地址
TTL: 600

类型: CNAME
主机记录: www
记录值: fee.sexychat.club
TTL: 600
```

### 2. 验证DNS解析
```bash
# 检查DNS解析
nslookup fee.sexychat.club
dig fee.sexychat.club

# 检查网站可访问性
curl -I http://fee.sexychat.club
```

## 🔒 SSL证书配置

### 方案一: Let's Encrypt (免费)
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d fee.sexychat.club

# 设置自动续期
sudo crontab -e
# 添加以下行:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 方案二: 手动配置SSL证书
```bash
# 创建SSL目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件
sudo cp fee.sexychat.club.crt /etc/nginx/ssl/
sudo cp fee.sexychat.club.key /etc/nginx/ssl/

# 设置权限
sudo chmod 600 /etc/nginx/ssl/fee.sexychat.club.key
sudo chmod 644 /etc/nginx/ssl/fee.sexychat.club.crt
```

### 验证SSL配置
```bash
# 测试SSL证书
openssl s_client -connect fee.sexychat.club:443 -servername fee.sexychat.club

# 在线SSL测试
# 访问: https://www.ssllabs.com/ssltest/
```

## 🔧 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :34145
sudo lsof -i :34145

# 杀死占用进程
sudo kill -9 <PID>
```

#### 2. 权限问题
```bash
# 修复文件权限
sudo chown -R $USER:$USER /path/to/fans-fee
sudo chmod -R 755 /path/to/fans-fee
```

#### 3. 内存不足
```bash
# 查看内存使用
free -h
top

# 增加swap空间
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. Docker问题
```bash
# 重启Docker服务
sudo systemctl restart docker

# 清理Docker资源
docker system prune -a -f

# 查看Docker日志
sudo journalctl -u docker.service
```

### 日志查看
```bash
# PM2日志
pm2 logs fans-fee

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker日志
docker-compose logs -f fans-fee-app
docker-compose logs -f fans-fee-nginx
```

## ⚡ 性能优化

### 1. Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 1024;

# 启用Gzip压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;

# 静态文件缓存
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Node.js优化
```bash
# 设置环境变量
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512"

# PM2集群模式
pm2 start app.js -i max --name "fans-fee-cluster"
```

### 3. 监控设置
```bash
# 安装监控工具
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# 设置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 📊 健康检查

### 应用健康检查
```bash
# 检查应用状态
curl http://localhost:34145/api/health

# 检查HTTPS访问
curl -k https://fee.sexychat.club/api/health
```

### 自动化监控脚本
```bash
#!/bin/bash
# health-check.sh

URL="https://fee.sexychat.club/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Service is healthy"
else
    echo "$(date): Service is down (HTTP $RESPONSE)"
    # 重启服务
    pm2 restart fans-fee
fi
```

## 🔄 更新部署

### 1. 代码更新
```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重启应用
pm2 restart fans-fee
```

### 2. Docker更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📞 技术支持

如果在部署过程中遇到问题，请:

1. 查看相关日志文件
2. 检查防火墙和端口设置
3. 验证域名DNS解析
4. 确认SSL证书有效性
5. 联系技术支持团队

---

**注意**: 请确保在生产环境中使用HTTPS，并定期更新系统和依赖包以保证安全性。