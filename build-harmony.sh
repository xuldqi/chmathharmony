#!/bin/bash

echo "🚀 开始构建HarmonyOS应用..."

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf build/
rm -rf .hvigor/

# 同步依赖
echo "📦 同步依赖..."
./hvigorw --sync

# 构建应用
echo "🔨 构建应用..."
./hvigorw assembleHap

echo "✅ 构建完成！"
