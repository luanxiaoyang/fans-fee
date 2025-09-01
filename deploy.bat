@echo off
echo 正在构建和部署直播成本计算系统...
echo.

echo 1. 停止现有容器...
docker-compose down

echo.
echo 2. 构建Docker镜像...
docker-compose build

echo.
echo 3. 启动服务...
docker-compose up -d

echo.
echo 4. 检查服务状态...
docker-compose ps

echo.
echo 部署完成！
echo 访问地址: http://localhost:34145
echo.
echo 查看日志: docker-compose logs -f
echo 停止服务: docker-compose down
echo.
pause