#!/bin/bash

# React应用构建脚本
# 用于构建React应用并复制到鸿蒙项目中

set -e  # 遇到错误立即退出

echo "🚀 开始构建React应用..."

# 项目目录
PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
REACT_SRC_DIR="$PROJECT_ROOT/react-src"
HARMONY_RESOURCES_DIR="$PROJECT_ROOT/entry/src/main/resources/rawfile"
REACT_BUILD_DIR="$REACT_SRC_DIR/dist"

echo "📁 项目根目录: $PROJECT_ROOT"
echo "📁 React源码目录: $REACT_SRC_DIR"
echo "📁 鸿蒙资源目录: $HARMONY_RESOURCES_DIR"

# 检查React源码目录是否存在
if [ ! -d "$REACT_SRC_DIR" ]; then
    echo "❌ React源码目录不存在: $REACT_SRC_DIR"
    echo "请先将React项目复制到 react-src 目录"
    exit 1
fi

# 进入React源码目录
cd "$REACT_SRC_DIR"

echo "📦 安装React依赖..."
npm install

# 检查是否需要添加鸿蒙适配器
ADAPTER_DIR="$REACT_SRC_DIR/src/adapters"
if [ ! -d "$ADAPTER_DIR" ]; then
    echo "📝 复制鸿蒙适配器..."
    mkdir -p "$ADAPTER_DIR"
    cp -r "$PROJECT_ROOT/react-adapters/"* "$ADAPTER_DIR/"
    echo "✅ 鸿蒙适配器复制完成"
fi

echo "🔧 构建React应用..."
npm run build

# 检查构建是否成功
if [ ! -d "$REACT_BUILD_DIR" ]; then
    echo "❌ React构建失败，dist目录不存在"
    exit 1
fi

echo "📋 复制构建产物到鸿蒙项目..."

# 创建目标目录
mkdir -p "$HARMONY_RESOURCES_DIR/react-app"

# 复制构建产物
cp -r "$REACT_BUILD_DIR/"* "$HARMONY_RESOURCES_DIR/react-app/"

# 复制音频资源
if [ -d "$REACT_SRC_DIR/public/audio" ]; then
    echo "🎵 复制音频资源..."
    cp -r "$REACT_SRC_DIR/public/audio" "$HARMONY_RESOURCES_DIR/react-app/"
fi

# 修改index.html中的资源路径
INDEX_FILE="$HARMONY_RESOURCES_DIR/react-app/index.html"
if [ -f "$INDEX_FILE" ]; then
    echo "🔄 修改资源路径..."
    
    # 备份原文件
    cp "$INDEX_FILE" "$INDEX_FILE.bak"
    
    # 修改资源路径，移除开头的 /
    sed -i.tmp 's|src="/|src="|g' "$INDEX_FILE"
    sed -i.tmp 's|href="/|href="|g' "$INDEX_FILE"
    sed -i.tmp 's|="assets/|="./assets/|g' "$INDEX_FILE"
    
    # 添加HarmonyOS特定的meta标签
    sed -i.tmp '/<head>/a\
    <meta name="platform" content="harmonyos">\
    <meta name="harmonyos-webview" content="true">' "$INDEX_FILE"
    
    # 清理临时文件
    rm -f "$INDEX_FILE.tmp"
    
    echo "✅ 资源路径修改完成"
fi

# 生成资源清单
echo "📄 生成资源清单..."
MANIFEST_FILE="$HARMONY_RESOURCES_DIR/react-app/manifest.json"
cat > "$MANIFEST_FILE" << EOF
{
  "name": "chmath-react-app",
  "version": "1.0.0",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "platform": "harmonyos",
  "files": [
$(cd "$HARMONY_RESOURCES_DIR/react-app" && find . -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.ogg" -o -name "*.mp3" | sed 's/^/    "/' | sed 's/$/"/' | sed '$!s/$/,/')
  ]
}
EOF

echo "📊 构建统计信息:"
echo "  - HTML文件: $(find "$HARMONY_RESOURCES_DIR/react-app" -name "*.html" | wc -l)"
echo "  - JS文件: $(find "$HARMONY_RESOURCES_DIR/react-app" -name "*.js" | wc -l)"
echo "  - CSS文件: $(find "$HARMONY_RESOURCES_DIR/react-app" -name "*.css" | wc -l)"
echo "  - 音频文件: $(find "$HARMONY_RESOURCES_DIR/react-app" -name "*.ogg" -o -name "*.mp3" | wc -l)"

# 计算总大小
TOTAL_SIZE=$(du -sh "$HARMONY_RESOURCES_DIR/react-app" | cut -f1)
echo "  - 总大小: $TOTAL_SIZE"

echo ""
echo "🎉 React应用构建完成！"
echo "📁 构建产物位置: $HARMONY_RESOURCES_DIR/react-app"
echo ""
echo "下一步:"
echo "  1. 使用DevEco Studio打开鸿蒙项目"
echo "  2. 构建并运行鸿蒙应用"
echo "  3. 测试React应用在WebView中的运行效果"
echo ""


