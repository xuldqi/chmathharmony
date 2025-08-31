#!/bin/bash

# HarmonyOS 儿童语音计算器 - 自动构建和安装脚本
# 绕过 DevEco Studio 的 hvigor 问题

set -e  # 遇到错误时退出

echo "🚀 开始构建 HarmonyOS 儿童语音计算器..."
echo "================================================"

# 检查 hvigorw 脚本是否存在
if [ ! -f "./hvigorw" ]; then
    echo "❌ 错误：找不到 hvigorw 脚本"
    exit 1
fi

# 检查 hdc 工具是否存在
HDC_PATH="/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc"
if [ ! -f "$HDC_PATH" ]; then
    echo "❌ 错误：找不到 hdc 工具，请确保 DevEco Studio 已正确安装"
    exit 1
fi

echo "📦 步骤 1: 清理项目..."
./hvigorw clean
if [ $? -ne 0 ]; then
    echo "❌ 清理失败"
    exit 1
fi
echo "✅ 清理完成"

echo "🔨 步骤 2: 构建项目..."
./hvigorw assembleHap
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 构建成功！签名问题已解决！"
else
    echo "⚠️  构建过程中出现错误（可能是签名问题），但 HAP 文件可能已生成"
fi

# 检查 HAP 文件是否存在
HAP_FILE="entry/build/default/outputs/default/entry-default-unsigned.hap"
if [ ! -f "$HAP_FILE" ]; then
    echo "❌ 错误：未找到 HAP 文件，构建失败"
    exit 1
fi

echo "📱 步骤 3: 检查设备连接..."
"$HDC_PATH" list targets > /tmp/hdc_targets.txt
if [ -s /tmp/hdc_targets.txt ]; then
    echo "✅ 发现已连接的设备："
    cat /tmp/hdc_targets.txt
else
    echo "⚠️  未发现已连接的设备或模拟器"
    echo "请确保："
    echo "  1. HarmonyOS 设备已连接并开启开发者模式"
    echo "  2. 或者 HarmonyOS 模拟器正在运行"
    echo "  3. 设备已通过 USB 调试授权"
    echo ""
    echo "您可以手动运行以下命令安装："
    echo "$HDC_PATH install $HAP_FILE"
    exit 1
fi

echo "📲 步骤 4: 安装应用..."
"$HDC_PATH" install "$HAP_FILE"
INSTALL_EXIT_CODE=$?

if [ $INSTALL_EXIT_CODE -eq 0 ]; then
    echo "✅ 应用安装成功！"
    
    echo "🚀 步骤 5: 启动应用..."
    "$HDC_PATH" shell aa start -a EntryAbility -b com.example.chamath
    
    if [ $? -eq 0 ]; then
        echo "✅ 应用启动成功！"
        echo ""
        echo "🎉 恭喜！HarmonyOS 儿童语音计算器已成功安装并启动"
        echo "================================================"
        echo "应用功能："
        echo "  • 儿童友好的计算器界面"
        echo "  • 语音播报计算结果"
        echo "  • 触摸反馈和动画效果"
        echo "  • 数据存储功能"
        echo "================================================"
    else
        echo "⚠️  应用安装成功，但启动失败"
        echo "您可以手动在设备上启动应用"
    fi
else
    echo "❌ 应用安装失败"
    echo ""
    echo "可能的原因："
    echo "  1. syscap 系统能力检查失败（模拟器兼容性问题）"
    echo "  2. 设备 API 版本不匹配"
    echo "  3. 应用权限配置问题"
    echo ""
    echo "建议解决方案："
    echo "  1. 尝试在真实的 HarmonyOS 设备上安装"
    echo "  2. 创建更高 API 版本的模拟器"
    echo "  3. 查看详细错误信息：$HDC_PATH hilog"
    echo ""
    echo "相关文档："
    echo "  • SYSCAP_TROUBLESHOOTING.md - syscap 问题排除指南"
    echo "  • INSTALLATION_GUIDE.md - 详细安装指南"
    
    exit 1
fi

echo ""
echo "📋 构建信息："
echo "  HAP 文件：$HAP_FILE"
echo "  文件大小：$(ls -lh "$HAP_FILE" | awk '{print $5}')"
echo "  构建时间：$(date)"
echo ""
echo "如需重新安装，请运行："
echo "  $HDC_PATH uninstall com.example.chamath"
echo "  $HDC_PATH install $HAP_FILE"

rm -f /tmp/hdc_targets.txt
echo "🎯 脚本执行完成！"