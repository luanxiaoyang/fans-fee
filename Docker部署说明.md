# Docker部署说明

## 部署状态

✅ **配置完成**: 所有Docker配置文件已创建  
✅ **Nginx集成**: 已添加Nginx反向代理支持  
⚠️ **网络问题**: Docker镜像拉取可能受网络限制影响  
✅ **本地验证**: 应用在端口34145正常运行  

## 配置文件说明

### 1. Dockerfile
- 基于 `node:18-alpine` 镜像
- 工作目录: `/app`
- 暴露端口: `34145`
- 生产环境优化配置

### 2. docker-compose.yml
- **Node.js服务**: `fans-fee-app` (内部端口34145)
- **Nginx服务**: `nginx` (对外端口80/443)
- 健康检查和服务依赖配置
- 独立网络: `fans-fee-network`

### 3. nginx.conf
- 反向代理配置，将请求转发到Node.js应用
- 静态文件缓存优化
- 安全头配置
- Gzip压缩支持

### 4. Dockerfile.nginx
- 基于 `nginx:1.25-alpine` 镜像
- 自定义配置和健康检查
- 时区设置和日志配置

### 5. .dockerignore
- 排除 `node_modules`、日志文件等
- 优化构建速度和镜像大小

### 6. deploy.bat (Windows) / deploy.sh (Linux)
- Windows一键部署脚本
- 包含停止、构建、启动、状态检查

## 部署方式

### 方式1: 使用部署脚本（推荐）
```bash
# Windows环境
deploy.bat

# Linux环境
chmod +x deploy.sh
./deploy.sh deploy
```

### 方式2: 手动Docker命令
```bash
# 构建并启动（包含Nginx）
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 单独查看Nginx日志
docker-compose logs -f nginx

# 停止服务
docker-compose down
```

### 方式3: 传统Node.js部署
```bash
# 安装依赖
npm install

# 启动服务
npm start
```

## 网络问题解决方案

**当前状态**: 检测到Docker镜像拉取失败（网络连接超时）

### 🚀 快速解决方案
运行网络问题修复脚本：
```bash
docker-fix-network.bat
```

### 📋 手动解决方案
如果遇到Docker镜像拉取失败，可以尝试以下解决方案：

### 1. 配置Docker镜像源
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

### 2. 使用国内镜像
修改Dockerfile第一行：
```dockerfile
# 原版
FROM node:18-alpine

# 国内镜像
FROM registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine
```

### 3. 离线部署
如果网络环境受限，建议使用传统Node.js部署方式：
1. 确保本地已安装Node.js 18+
2. 运行 `npm install` 安装依赖
3. 运行 `npm start` 启动服务
4. 访问 http://localhost:34145

## 验证部署

### 健康检查
```bash
# 检查Nginx健康状态
curl http://localhost/health

# 检查Node.js应用（通过Nginx代理）
curl http://localhost/

# 直接检查Node.js应用（容器内部）
docker exec fans-fee-app curl http://localhost:34145
```

### 功能测试
1. **通过Nginx访问**: http://localhost （推荐）
2. **直接访问Node.js**: http://localhost:34145 （仅开发调试）
3. 输入测试数据进行计算
4. 验证结果正确性

### 服务架构
```
用户请求 → Nginx (端口80) → Node.js应用 (端口34145)
```

## 生产环境建议

1. **SSL证书**: 将证书文件放入 `./ssl/` 目录并启用HTTPS配置
2. **域名配置**: 修改 `nginx.conf` 中的 `server_name`
3. **日志管理**: 配置日志收集和轮转（已配置基础日志）
4. **监控告警**: 配置服务监控和告警
5. **备份策略**: 定期备份配置和数据
6. **负载均衡**: 多实例部署时配置负载均衡

### HTTPS配置步骤
1. 将SSL证书文件放入 `./ssl/` 目录：
   - `cert.pem` (证书文件)
   - `key.pem` (私钥文件)
2. 取消 `nginx.conf` 中HTTPS配置的注释
3. 重启服务: `docker-compose restart nginx`

## 故障排除

### 常见问题
1. **端口占用**: 检查34145端口是否被占用
2. **权限问题**: 确保Docker有足够权限
3. **内存不足**: 确保系统有足够内存运行容器
4. **网络连接**: 检查防火墙和网络配置

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看Node.js应用日志
docker-compose logs -f fans-fee-app

# 查看Nginx日志
docker-compose logs -f nginx

# 查看Nginx访问日志（主机目录）
tail -f ./logs/nginx/access.log

# 查看Nginx错误日志（主机目录）
tail -f ./logs/nginx/error.log
```

## Linux部署脚本使用说明

### 脚本功能
```bash
# 完整部署
./deploy.sh deploy

# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 清理资源
./deploy.sh clean

# 显示帮助
./deploy.sh help
```

### 脚本特性
- 🎨 彩色输出和进度提示
- 🔍 自动检查系统依赖
- 📁 自动创建必要目录
- 🔄 服务健康检查
- 🧹 资源清理功能
- 📊 详细的状态显示