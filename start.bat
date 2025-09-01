@echo off
echo 🚀 启动直播成本计算系统 (Node.js版本)...
echo.
echo 📋 正在检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请先安装Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 📦 正在安装依赖包...
npm install

echo.
echo 🌐 启动服务器...
echo 📍 访问地址: http://localhost:34145
echo ⏹️  按 Ctrl+C 停止服务
echo.
npm start

pause
