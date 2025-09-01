# 🎯 粉丝费用计算器

一个基于 Node.js 的 Web 应用，用于计算直播行业的各项成本指标，包括上粉成本、注册成本、付费成本等。

## ✨ 功能特点

- 🚀 **实时计算**: 输入参数后立即获得精确的成本分析
- 📊 **多维度分析**: 支持上粉、注册、付费、价值等多种成本计算
- 📱 **响应式设计**: 完美适配桌面端和移动端设备
- 📋 **智能报告**: 自动生成详细的成本分析报告
- 💾 **数据导出**: 支持报告内容的复制和文件下载
- 🔒 **隐私保护**: 所有计算在本地完成，数据不上传

## 🛠️ 技术栈

- **后端**: Node.js + Express.js
- **前端**: HTML5 + CSS3 + JavaScript
- **部署**: Docker + Nginx
- **域名**: fee.sexychat.club

## 📊 核心计算公式

### 成本计算
```
上粉总成本 = 小组成员 × 150 + 上粉数量 × 0.2 + (通道数量 × 200) ÷ 25 + 网络费用(100) + 账号数量 × 16
注册总成本 = 上粉总成本 + 上粉数量 × 0.15
付费总成本 = 注册总成本 + 转化人员工资
价值总成本 = 付费总成本
```

### 单位成本
```
每个上粉成本 = 上粉总成本 ÷ 上粉数量
单个注册成本 = 注册总成本 ÷ 注册数量
单个付费成本 = 付费总成本 ÷ 付费数量
单个价值成本 = 付费总成本 ÷ 价值数量
```

## 🚀 快速开始

### 在线访问
访问 [https://fee.sexychat.club](https://fee.sexychat.club) 直接使用

### 本地开发
```bash
# 克隆项目
git clone <repository-url>
cd fans-fee

# 安装依赖
npm install

# 启动服务
npm start

# 访问应用
# http://localhost:34145
```

### Docker 部署
```bash
# 构建并启动服务
docker-compose up -d

# 访问应用
# http://localhost (通过 Nginx)
```

## 📖 详细文档

- [部署指南](DEPLOYMENT.md) - 详细的部署和配置说明
- [说明文档](说明文档.md) - 项目开发历程和技术细节
- [Docker部署说明](Docker部署说明.md) - Docker 相关配置说明

## 🔧 项目结构

```
fans-fee/
├── app.js                    # 主应用文件
├── package.json             # 项目配置
├── Dockerfile              # Node.js 应用容器配置
├── Dockerfile.nginx        # Nginx 容器配置
├── nginx.conf              # Nginx 反向代理配置
├── docker-compose.yml      # Docker 编排配置
├── deploy.sh               # Linux 部署脚本
└── static/                 # 静态文件目录
    └── index.html          # 前端页面
```

## 🌐 在线演示

访问 [https://fee.sexychat.club](https://fee.sexychat.club) 查看在线演示

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**注意**: 本工具仅用于成本计算分析，请确保在合法合规的范围内使用。
