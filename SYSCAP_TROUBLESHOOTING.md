# HarmonyOS 应用安装故障排除指南

## 当前问题
应用安装时出现 `error: install failed due to check syscap filed` 错误（错误代码：9568293）

## 问题分析
`syscap` 是 HarmonyOS 的系统能力（System Capability）检查机制，用于确保应用所需的系统能力与目标设备兼容。

## 已尝试的解决方案

### 1. 配置优化
- ✅ 移除了 `tablet` 设备类型，仅保留 `default`
- ✅ 移除了 `MICROPHONE` 权限（模拟器可能不支持）
- ✅ 移除了所有权限配置以简化应用
- ✅ 降低了 API 版本从 12 到 9
- ✅ 修正了 `apiReleaseType` 格式

### 2. 构建优化
- ✅ 使用未签名的 HAP 文件安装
- ✅ 清理并重新构建项目

## 可能的根本原因

### 1. 模拟器版本不匹配
当前连接的 HarmonyOS 模拟器可能：
- API 版本过低，不支持应用所需的系统能力
- 系统能力集合不完整
- 模拟器配置有问题

### 2. 系统能力依赖
应用可能隐式依赖了某些系统能力，即使没有显式声明权限

## 建议的解决方案

### 方案 1：使用真实设备
```bash
# 连接真实的 HarmonyOS 设备
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc list targets
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
```

### 方案 2：更新模拟器
1. 在 DevEco Studio 中打开 Device Manager
2. 创建新的 HarmonyOS 模拟器，选择更高的 API 版本
3. 确保模拟器支持所需的系统能力

### 方案 3：进一步简化应用
```bash
# 创建最小化的测试应用
# 移除所有 WebView 和复杂功能
# 仅保留基本的 UI 显示
```

### 方案 4：通过 DevEco Studio 安装
1. 在 DevEco Studio 中打开项目
2. 选择目标设备
3. 点击 "Run" 按钮进行安装和调试
4. 查看详细的错误日志

## 调试步骤

### 1. 检查设备信息
```bash
# 获取设备系统信息
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc shell getprop

# 检查支持的系统能力
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc shell syscap
```

### 2. 查看详细日志
```bash
# 查看系统日志
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc hilog

# 过滤安装相关日志
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc hilog | grep -i install
```

### 3. 验证 HAP 文件
```bash
# 检查 HAP 文件内容
unzip -l entry/build/default/outputs/default/entry-default-unsigned.hap

# 验证配置文件
unzip -p entry/build/default/outputs/default/entry-default-unsigned.hap module.json
```

## 当前状态
- ✅ 项目构建成功
- ✅ HAP 文件生成正常
- ❌ 安装到模拟器失败（syscap 检查）
- ❓ 需要在真实设备或更新的模拟器上测试

## 下一步建议
1. **优先**：尝试在真实的 HarmonyOS 设备上安装
2. 在 DevEco Studio 中创建新的模拟器（API 10+）
3. 通过 DevEco Studio 的图形界面进行安装和调试
4. 如果问题持续，考虑联系华为开发者支持

## 文件位置
- 未签名 HAP：`entry/build/default/outputs/default/entry-default-unsigned.hap`
- 配置文件：`entry/src/main/module.json5`
- 应用配置：`AppScope/app.json5`
- 构建配置：`build-profile.json5`