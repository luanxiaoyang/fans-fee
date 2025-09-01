#!/bin/bash

# 粉丝费用计算器 - Linux Docker部署脚本
# 支持Nginx反向代理的完整部署方案
# 作者: fans-fee-calculator
# 版本: 1.0.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="fans-fee-calculator"
APP_PORT=34145
NGINX_PORT=80
HTTPS_PORT=443

# 函数：打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_message $RED "错误: $1 命令未找到，请先安装 $1"
        exit 1
    fi
}

# 函数：检查Docker和Docker Compose
check_dependencies() {
    print_message $BLUE "检查系统依赖..."
    check_command "docker"
    check_command "docker-compose"
    
    # 检查Docker服务状态
    if ! docker info &> /dev/null; then
        print_message $RED "错误: Docker服务未运行，请启动Docker服务"
        exit 1
    fi
    
    print_message $GREEN "✓ 系统依赖检查通过"
}

# 函数：创建必要的目录
create_directories() {
    print_message $BLUE "创建必要的目录..."
    
    # 创建日志目录
    mkdir -p logs/nginx
    mkdir -p ssl  # SSL证书目录
    
    # 设置权限
    chmod 755 logs
    chmod 755 logs/nginx
    chmod 755 ssl
    
    print_message $GREEN "✓ 目录创建完成"
}

# 函数：停止现有服务
stop_services() {
    print_message $BLUE "停止现有服务..."
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        print_message $GREEN "✓ 现有服务已停止"
    else
        print_message $YELLOW "没有运行中的服务"
    fi
}

# 函数：清理旧的镜像和容器
cleanup_old_resources() {
    print_message $BLUE "清理旧的Docker资源..."
    
    # 删除停止的容器
    docker container prune -f
    
    # 删除未使用的镜像
    docker image prune -f
    
    print_message $GREEN "✓ 旧资源清理完成"
}

# 函数：构建和启动服务
build_and_start() {
    print_message $BLUE "构建Docker镜像..."
    
    # 构建镜像
    docker-compose build --no-cache
    
    print_message $BLUE "启动服务..."
    
    # 启动服务
    docker-compose up -d
    
    print_message $GREEN "✓ 服务启动完成"
}

# 函数：等待服务就绪
wait_for_services() {
    print_message $BLUE "等待服务就绪..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:$NGINX_PORT/health &> /dev/null; then
            print_message $GREEN "✓ 服务已就绪"
            return 0
        fi
        
        print_message $YELLOW "等待服务启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_message $RED "警告: 服务启动超时，请检查日志"
    return 1
}

# 函数：显示服务状态
show_status() {
    print_message $BLUE "服务状态:"
    docker-compose ps
    
    echo
    print_message $BLUE "服务日志 (最近10行):"
    docker-compose logs --tail=10
}

# 函数：显示访问信息
show_access_info() {
    local server_ip=$(hostname -I | awk '{print $1}')
    
    echo
    print_message $GREEN "🎉 部署完成！"
    echo
    print_message $BLUE "访问地址:"
    echo "  本地访问: http://localhost:$NGINX_PORT"
    echo "  局域网访问: http://$server_ip:$NGINX_PORT"
    echo "  健康检查: http://localhost:$NGINX_PORT/health"
    echo
    print_message $BLUE "管理命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo "  查看状态: docker-compose ps"
    echo
    print_message $YELLOW "注意: 如需HTTPS访问，请将SSL证书放入 ./ssl/ 目录并修改nginx配置"
}

# 函数：显示帮助信息
show_help() {
    echo "粉丝费用计算器 - Linux Docker部署脚本"
    echo
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  deploy    完整部署 (默认)"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  status    查看状态"
    echo "  logs      查看日志"
    echo "  clean     清理资源"
    echo "  help      显示帮助"
    echo
    echo "示例:"
    echo "  $0 deploy   # 完整部署"
    echo "  $0 start    # 启动服务"
    echo "  $0 logs     # 查看日志"
}

# 主函数：完整部署
deploy() {
    print_message $GREEN "开始部署 $PROJECT_NAME..."
    
    check_dependencies
    create_directories
    stop_services
    cleanup_old_resources
    build_and_start
    
    if wait_for_services; then
        show_access_info
    else
        show_status
    fi
}

# 主函数：启动服务
start() {
    print_message $BLUE "启动服务..."
    docker-compose up -d
    wait_for_services
    show_access_info
}

# 主函数：停止服务
stop() {
    print_message $BLUE "停止服务..."
    docker-compose down
    print_message $GREEN "✓ 服务已停止"
}

# 主函数：重启服务
restart() {
    print_message $BLUE "重启服务..."
    docker-compose restart
    wait_for_services
    show_access_info
}

# 主函数：查看日志
logs() {
    print_message $BLUE "查看服务日志..."
    docker-compose logs -f
}

# 主函数：清理资源
clean() {
    print_message $BLUE "清理Docker资源..."
    docker-compose down -v --rmi all
    docker system prune -f
    print_message $GREEN "✓ 资源清理完成"
}

# 脚本入口
main() {
    case "${1:-deploy}" in
        "deploy")
            deploy
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "status")
            show_status
            ;;
        "logs")
            logs
            ;;
        "clean")
            clean
            ;;
        "help")
            show_help
            ;;
        *)
            print_message $RED "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 检查是否以root权限运行
if [[ $EUID -eq 0 ]]; then
    print_message $YELLOW "警告: 不建议以root权限运行此脚本"
fi

# 执行主函数
main "$@"