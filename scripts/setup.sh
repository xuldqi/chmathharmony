#!/bin/bash

# 项目快速设置脚本
# 自动化完成React项目的鸿蒙适配设置

set -e  # 遇到错误立即退出

echo "🚀 开始鸿蒙项目设置..."

# 项目目录
PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
FLUTTER_PROJECT_PATH="/Users/macmima1234/Documents/project/chmath"
REACT_SRC_DIR="$PROJECT_ROOT/react-src"

echo "📁 项目根目录: $PROJECT_ROOT"
echo "📁 Flutter原项目: $FLUTTER_PROJECT_PATH"

# 检查原项目是否存在
if [ ! -d "$FLUTTER_PROJECT_PATH" ]; then
    echo "❌ 原Flutter项目不存在: $FLUTTER_PROJECT_PATH"
    echo "请确认项目路径是否正确"
    exit 1
fi

# 第一步：复制React项目
echo "📋 第一步：复制React项目到react-src目录..."
if [ -d "$REACT_SRC_DIR" ]; then
    echo "⚠️ react-src目录已存在，是否覆盖？(y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        rm -rf "$REACT_SRC_DIR"
    else
        echo "跳过复制步骤"
    fi
fi

if [ ! -d "$REACT_SRC_DIR" ]; then
    cp -r "$FLUTTER_PROJECT_PATH" "$REACT_SRC_DIR"
    echo "✅ React项目复制完成"
fi

# 第二步：安装React依赖
echo "📦 第二步：安装React依赖..."
cd "$REACT_SRC_DIR"
npm install
echo "✅ React依赖安装完成"

# 第三步：集成鸿蒙适配器
echo "🔧 第三步：集成鸿蒙适配器..."
ADAPTER_DIR="$REACT_SRC_DIR/src/adapters"
if [ ! -d "$ADAPTER_DIR" ]; then
    mkdir -p "$ADAPTER_DIR"
    cp -r "$PROJECT_ROOT/react-adapters/"* "$ADAPTER_DIR/"
    echo "✅ 鸿蒙适配器集成完成"
else
    echo "⚠️ 适配器目录已存在，跳过集成"
fi

# 第四步：修改React应用的import语句
echo "📝 第四步：修改React应用的import语句..."

# 备份原文件
echo "   创建备份..."
find "$REACT_SRC_DIR/src" -name "*.tsx" -o -name "*.ts" | while read file; do
    if [ ! -f "${file}.bak" ]; then
        cp "$file" "${file}.bak"
    fi
done

# 修改useAudio的导入
echo "   修改useAudio导入..."
find "$REACT_SRC_DIR/src" -name "*.tsx" -o -name "*.ts" -exec sed -i.tmp \
    "s|from '../hooks/useAudio'|from '../adapters'|g; \
     s|from '\.\./hooks/useAudio'|from '../adapters'|g; \
     s|from '@/hooks/useAudio'|from '../adapters'|g" {} \;

# 修改其他可能的导入
echo "   修改其他Hook导入..."
find "$REACT_SRC_DIR/src" -name "*.tsx" -o -name "*.ts" -exec sed -i.tmp \
    "s|import { useAudio }|import { useAudio, useStorage, useVoice }|g" {} \;

# 清理临时文件
find "$REACT_SRC_DIR/src" -name "*.tmp" -delete

echo "✅ Import语句修改完成"

# 第五步：添加平台检测代码
echo "🔍 第五步：添加平台检测代码..."
PLATFORM_DETECT_FILE="$REACT_SRC_DIR/src/utils/platformDetect.ts"
if [ ! -f "$PLATFORM_DETECT_FILE" ]; then
    cat > "$PLATFORM_DETECT_FILE" << 'EOF'
/**
 * 平台检测工具
 */

export const isHarmonyOS = (): boolean => {
  return !!(window as any).HarmonyBridge;
};

export const isWeb = (): boolean => {
  return !isHarmonyOS();
};

export const getPlatform = (): 'harmonyos' | 'web' => {
  return isHarmonyOS() ? 'harmonyos' : 'web';
};

export const waitForPlatformReady = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isHarmonyOS()) {
      // 等待HarmonyBridge就绪
      const checkReady = () => {
        if ((window as any).HarmonyBridge) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    } else {
      // Web环境立即就绪
      resolve();
    }
  });
};
EOF
    echo "✅ 平台检测工具创建完成"
fi

# 第六步：构建React应用
echo "🔨 第六步：构建React应用..."
cd "$PROJECT_ROOT"
./scripts/build-react.sh

echo ""
echo "🎉 项目设置完成！"
echo ""
echo "接下来的步骤："
echo "1. 使用DevEco Studio打开项目: $PROJECT_ROOT"
echo "2. 等待项目索引完成"
echo "3. 连接鸿蒙设备或启动模拟器"
echo "4. 点击运行按钮"
echo ""
echo "如果遇到问题，请查看README.md中的故障排除部分"
echo ""
echo "项目结构："
echo "  📱 鸿蒙应用: entry/"
echo "  🌐 React源码: react-src/"
echo "  🔧 适配器: react-adapters/"
echo "  📜 构建脚本: scripts/"
echo ""
echo "祝您开发顺利！🚀"


