# 使用官方Node.js运行时作为基础镜像
# 如果网络问题，可以使用国内镜像源：
# FROM registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装项目依赖
RUN npm install --only=production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 34145

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=34145

# 启动应用
CMD ["npm", "start"]