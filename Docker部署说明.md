# Docker部署说明

## 部署状态

✅ **配置完成**: 所有Docker配置文件已创建  
⚠️ **网络问题**: Docker镜像拉取可能受网络限制影响  
✅ **本地验证**: 应用在端口34145正常运行  

## 配置文件说明

### 1. Dockerfile
- 基于 `node:18-alpine` 镜像
- 工作目录: `/app`
- 暴露端口: `34145`
- 生产环境优化配置

### 2. docker-compose.yml
- 服务名: `fans-fee-calculator`
- 端口映射: `34145:34145`
- 自动重启: `unless-stopped`
- 独立网络: `fans-fee-network`

### 3. .dockerignore
- 排除 `node_modules`、日志文件等
- 优化构建速度和镜像大小

### 4. deploy.bat
- Windows一键部署脚本
- 包含停止、构建、启动、状态检查

## 部署方式

### 方式1: 使用部署脚本（推荐）
```bash
# Windows环境
deploy.bat
```

### 方式2: 手动Docker命令
```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

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
# 检查服务状态
curl http://localhost:34145/api/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-xx-xx",
  "uptime": "xx seconds"
}
```

### 功能测试
1. 访问 http://localhost:34145
2. 输入测试数据进行计算
3. 验证结果正确性

## 生产环境建议

1. **反向代理**: 使用Nginx作为反向代理
2. **SSL证书**: 配置HTTPS支持
3. **日志管理**: 配置日志收集和轮转
4. **监控告警**: 配置服务监控和告警
5. **备份策略**: 定期备份配置和数据

## 故障排除

### 常见问题
1. **端口占用**: 检查34145端口是否被占用
2. **权限问题**: 确保Docker有足够权限
3. **内存不足**: 确保系统有足够内存运行容器
4. **网络连接**: 检查防火墙和网络配置

### 日志查看
```bash
# Docker日志
docker-compose logs -f fans-fee-calculator

# 系统日志
# Windows: 事件查看器
# Linux: /var/log/
```