#!/bin/bash

# 儿童语音计算器 - 构建脚本
# 用于构建React应用并集成到HarmonyOS项目中

set -e  # 遇到错误时退出

echo "🚀 开始构建儿童语音计算器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    # 检查hvigorw
    if ! command -v hvigorw &> /dev/null; then
        print_warning "hvigorw未找到，请确保在HarmonyOS项目目录中"
    fi
    
    print_success "依赖检查完成"
}

# 构建React应用
build_react_app() {
    print_info "构建React应用..."
    
    if [ ! -d "react-app" ]; then
        print_warning "react-app目录不存在，跳过React构建"
        return
    fi
    
    cd react-app
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        print_info "安装React应用依赖..."
        npm install
    fi
    
    # 构建应用
    print_info "构建React应用..."
    npm run build
    
    # 复制构建产物到HarmonyOS资源目录
    print_info "复制构建产物..."
    mkdir -p ../entry/src/main/resources/rawfile/react-app
    cp -r dist/* ../entry/src/main/resources/rawfile/react-app/
    
    cd ..
    print_success "React应用构建完成"
}

# 构建HarmonyOS应用
build_harmony_app() {
    print_info "构建HarmonyOS应用..."
    
    # 检查是否在正确的目录
    if [ ! -f "build-profile.json5" ]; then
        print_error "未找到build-profile.json5，请确保在HarmonyOS项目根目录"
        exit 1
    fi
    
    # 清理之前的构建
    print_info "清理之前的构建..."
    hvigorw clean
    
    # 构建应用
    print_info "构建HarmonyOS应用..."
    hvigorw assembleHap
    
    print_success "HarmonyOS应用构建完成"
}

# 检查构建结果
check_build_result() {
    print_info "检查构建结果..."
    
    # 检查React应用文件
    if [ -f "entry/src/main/resources/rawfile/react-app/index.html" ]; then
        print_success "React应用文件存在"
    else
        print_warning "React应用文件不存在"
    fi
    
    # 检查HarmonyOS构建产物
    if [ -d "build/outputs" ]; then
        print_success "HarmonyOS构建产物存在"
        ls -la build/outputs/
    else
        print_warning "HarmonyOS构建产物不存在"
    fi
}

# 主函数
main() {
    print_info "开始构建流程..."
    
    # 检查依赖
    check_dependencies
    
    # 构建React应用
    build_react_app
    
    # 构建HarmonyOS应用
    build_harmony_app
    
    # 检查构建结果
    check_build_result
    
    print_success "🎉 构建完成！"
    print_info "下一步："
    print_info "1. 在DevEco Studio中打开项目"
    print_info "2. 连接设备或启动模拟器"
    print_info "3. 点击运行按钮"
}

# 处理命令行参数
case "${1:-}" in
    "react")
        check_dependencies
        build_react_app
        ;;
    "harmony")
        check_dependencies
        build_harmony_app
        ;;
    "clean")
        print_info "清理构建文件..."
        hvigorw clean
        rm -rf react-app/dist
        rm -rf entry/src/main/resources/rawfile/react-app/*
        print_success "清理完成"
        ;;
    "check")
        check_build_result
        ;;
    *)
        main
        ;;
esac


