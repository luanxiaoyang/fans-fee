# 粉丝费用计算器

基于 Node.js 的直播粉丝费用计算系统，帮助主播精确计算各项成本指标。

## 功能特点

- 🧮 **实时计算**：支持上粉成本、注册成本、付费成本、价值成本四大维度
- 📱 **响应式设计**：完美适配手机、平板、桌面设备
- 🔒 **数据安全**：本地计算，不存储任何敏感信息
- ⚡ **轻量高效**：纯前端计算，响应迅速
- 🎨 **现代界面**：简洁美观的用户体验

## 技术栈

- **后端**：Node.js + Express
- **前端**：HTML5 + CSS3 + JavaScript
- **部署**：Docker 容器化

## 核心计算公式

### 上粉成本
```
上粉成本 = 总花费 ÷ 新增粉丝数
```

### 注册成本
```
注册成本 = 总花费 ÷ 新注册用户数
```

### 付费成本
```
付费成本 = 总花费 ÷ 付费用户数
```

### 价值成本
```
价值成本 = 总花费 ÷ 用户充值金额
```

## 快速开始

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd fans-fee

# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问应用
# http://localhost:34145
```

### Docker 部署

```bash
# 构建并启动容器
docker-compose up -d

# 访问应用
# http://localhost:34145
```

### 手动部署

```bash
# 安装依赖
npm install --production

# 启动应用
NODE_ENV=production PORT=34145 node server.js
```

## 项目结构

```
fans-fee/
├── public/          # 静态资源文件
│   ├── index.html   # 主页面
│   ├── style.css    # 样式文件
│   └── script.js    # 前端逻辑
├── server.js        # Node.js 服务器
├── package.json     # 项目配置
├── Dockerfile       # Docker 构建文件
├── docker-compose.yml # Docker 编排文件
├── README.md        # 项目说明
└── DEPLOYMENT.md    # 部署指南
```

## 部署说明

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
