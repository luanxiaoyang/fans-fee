# 部署指南

本文档提供粉丝费用计算器的详细部署说明，支持开发环境和生产环境的多种部署方式。

## 环境要求

### 基础环境
- **Node.js**: 16.x 或更高版本
- **npm**: 8.x 或更高版本
- **操作系统**: Windows/Linux/macOS

### 可选环境
- **Docker**: 20.x 或更高版本（用于容器化部署）
- **PM2**: 全局进程管理器（用于生产环境）

## 开发环境部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd fans-fee
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm start
```

### 4. 访问应用
打开浏览器访问：`http://localhost:34145`

## 生产环境部署

### 方案一：直接部署

#### 1. 准备环境
```bash
# 安装 Node.js（以 Ubuntu 为例）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 进程管理器
npm install -g pm2
```

#### 2. 部署应用
```bash
# 克隆项目
git clone <repository-url>
cd fans-fee

# 安装生产依赖
npm install --production

# 使用 PM2 启动应用
pm2 start server.js --name "fans-fee" --env production

# 设置开机自启
pm2 startup
pm2 save
```

#### 3. 配置环境变量
```bash
# 创建环境配置文件
echo "NODE_ENV=production" > .env
echo "PORT=34145" >> .env
```

### 方案二：Docker 部署（推荐）

#### 1. 构建并启动容器
```bash
# 构建并启动
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f fans-fee-app
```

#### 2. 容器管理命令
```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新应用
git pull
docker-compose up -d --build
```

## 反向代理配置

如果需要使用域名访问或配置 HTTPS，建议在服务器上手动配置 Nginx 反向代理。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 反向代理配置
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

## SSL 证书配置

### 使用 Let's Encrypt（免费）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 使用自签名证书（测试）
```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

## 防火墙配置

### Ubuntu/Debian
```bash
# 开放应用端口
sudo ufw allow 34145

# 如果使用 Nginx
sudo ufw allow 'Nginx Full'

# 查看状态
sudo ufw status
```

### CentOS/RHEL
```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=34145/tcp
sudo firewall-cmd --reload

# 如果使用 Nginx
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 故障排除

### 常见问题

#### 1. 端口占用
```bash
# 查看端口占用
netstat -tlnp | grep 34145
# 或
lsof -i :34145

# 杀死占用进程
sudo kill -9 <PID>
```

#### 2. 权限问题
```bash
# 修改文件权限
sudo chown -R $USER:$USER /path/to/fans-fee
sudo chmod -R 755 /path/to/fans-fee
```

#### 3. Node.js 版本问题
```bash
# 检查 Node.js 版本
node --version
npm --version

# 使用 nvm 管理版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 4. Docker 相关问题
```bash
# 查看容器日志
docker logs fans-fee-app

# 进入容器调试
docker exec -it fans-fee-app /bin/sh

# 清理 Docker 资源
docker system prune -a
```

### 日志查看

#### PM2 日志
```bash
# 查看应用日志
pm2 logs fans-fee

# 查看错误日志
pm2 logs fans-fee --err

# 清空日志
pm2 flush
```

#### Docker 日志
```bash
# 实时查看日志
docker-compose logs -f fans-fee-app

# 查看最近日志
docker-compose logs --tail=100 fans-fee-app
```

## 性能优化

### Node.js 应用优化
```bash
# 设置 Node.js 内存限制
node --max-old-space-size=512 server.js

# 使用 PM2 集群模式
pm2 start server.js -i max --name "fans-fee-cluster"
```

### 系统监控
```bash
# 安装系统监控工具
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# 查看系统资源
pm2 monit
```

## 健康检查

### 创建健康检查脚本
```bash
#!/bin/bash
# health-check.sh

response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:34145/api/health)

if [ $response -eq 200 ]; then
    echo "应用运行正常"
    exit 0
else
    echo "应用异常，HTTP状态码: $response"
    exit 1
fi
```

### 设置定时检查
```bash
# 添加到 crontab
*/5 * * * * /path/to/health-check.sh
```

## 更新部署

### 手动更新
```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install --production

# 重启应用
pm2 restart fans-fee
```

### Docker 更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build
```

## 备份策略

### 代码备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "/backup/fans-fee_$DATE.tar.gz" /path/to/fans-fee
```

### 定期备份
```bash
# 添加到 crontab（每天凌晨2点备份）
0 2 * * * /path/to/backup-script.sh
```

---

如有问题，请查看项目 [README.md](./README.md) 或提交 Issue。