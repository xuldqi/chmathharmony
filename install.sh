#!/bin/bash

# HarmonyOS 儿童语音计算器 - 快速安装脚本

echo "🚀 HarmonyOS 儿童语音计算器 - 安装脚本"
echo "==========================================="

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# HDC 工具路径
HDC_PATH="/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc"

# 检查 DevEco Studio 是否安装
if [ ! -f "$HDC_PATH" ]; then
    echo -e "${RED}❌ DevEco Studio 未找到或未正确安装${NC}"
    echo -e "${YELLOW}请先安装 DevEco Studio：https://developer.harmonyos.com/cn/develop/deveco-studio${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DevEco Studio 已找到${NC}"

# 检查项目构建状态
if [ ! -f "entry/build/default/outputs/default/entry-default-signed.hap" ]; then
    echo -e "${YELLOW}⚠️  HAP 文件未找到，正在构建项目...${NC}"
    ./hvigorw clean && ./hvigorw assembleHap
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 项目构建失败${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ HAP 文件已准备就绪${NC}"

# 检查设备连接
echo -e "${BLUE}🔍 检查 HarmonyOS 设备连接...${NC}"
DEVICES=$($HDC_PATH list targets)

if [ -z "$DEVICES" ] || [ "$DEVICES" = "[Empty]" ]; then
    echo -e "${RED}❌ 未检测到 HarmonyOS 设备或模拟器${NC}"
    echo -e "${YELLOW}请确保：${NC}"
    echo "   1. HarmonyOS 设备已连接并开启开发者模式"
    echo "   2. 或者在 DevEco Studio 中启动模拟器"
    echo "   3. 设备已开启 USB 调试"
    echo ""
    echo -e "${BLUE}💡 建议使用 DevEco Studio 进行安装：${NC}"
    echo "   1. 打开 DevEco Studio"
    echo "   2. 导入此项目"
    echo "   3. 连接设备或启动模拟器"
    echo "   4. 点击 Run 按钮"
    exit 1
fi

echo -e "${GREEN}✅ 检测到设备：${NC}"
echo "$DEVICES"

# 安装应用
echo -e "${BLUE}📱 正在安装应用...${NC}"
HAP_FILE="entry/build/default/outputs/default/entry-default-signed.hap"

$HDC_PATH install "$HAP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 应用安装成功！${NC}"
    
    # 尝试启动应用
    echo -e "${BLUE}🚀 正在启动应用...${NC}"
    $HDC_PATH shell aa start -a EntryAbility -b com.example.chamath
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 应用启动成功！${NC}"
        echo ""
        echo -e "${BLUE}📋 应用功能：${NC}"
        echo "   ✅ 儿童友好的计算器界面"
        echo "   ✅ 语音播报数字和运算结果"
        echo "   ✅ 背景音乐和音效"
        echo "   ✅ 计算历史记录"
        echo "   ✅ 中文数字转换"
    else
        echo -e "${YELLOW}⚠️  应用安装成功，但自动启动失败${NC}"
        echo "请手动在设备上启动 '儿童语音计算器' 应用"
    fi
else
    echo -e "${RED}❌ 应用安装失败${NC}"
    echo -e "${YELLOW}请尝试：${NC}"
    echo "   1. 卸载旧版本：$HDC_PATH uninstall com.example.chamath"
    echo "   2. 重新安装：$HDC_PATH install $HAP_FILE"
    echo "   3. 或使用 DevEco Studio 进行安装"
    exit 1
fi

echo ""
echo -e "${GREEN}🎊 安装完成！享受使用儿童语音计算器吧！${NC}"
echo "==========================================="