# HarmonyOS 儿童语音计算器 - 安装指南

## 项目状态
✅ 项目构建成功  
✅ HAP 文件已生成  
✅ 所有 ArkTS 编译错误已修复  

## 安装前准备

### 1. 确认构建产物
项目已成功构建，生成的 HAP 文件位于：
```
entry/build/default/outputs/default/
├── entry-default-signed.hap     (已签名版本)
└── entry-default-unsigned.hap   (未签名版本)
```

### 2. 安装方式选择

#### 方式一：使用 DevEco Studio（推荐）
1. 打开 DevEco Studio
2. 导入项目：`File` → `Open` → 选择项目根目录
3. 连接 HarmonyOS 设备或启动模拟器
4. 点击 `Run` 按钮直接安装运行

#### 方式二：使用命令行安装

**前提条件：**
- 已安装 DevEco Studio
- 已连接 HarmonyOS 设备或启动模拟器
- 设备已开启开发者模式和 USB 调试

**安装步骤：**

1. **配置 hdc 工具路径**
```bash
# 添加到 ~/.zshrc 或 ~/.bash_profile
export PATH="$PATH:/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains"
source ~/.zshrc
```

2. **检查设备连接**
```bash
hdc list targets
```

3. **安装应用**
```bash
# 安装已签名版本（推荐）
hdc install entry/build/default/outputs/default/entry-default-signed.hap

# 或安装未签名版本
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
```

4. **启动应用**
```bash
hdc shell aa start -a EntryAbility -b com.example.chamath
```

## HarmonyOS 设备/模拟器设置

### 真机设备
1. 进入 `设置` → `系统和更新` → `开发人员选项`
2. 开启 `开发人员选项`
3. 开启 `USB 调试`
4. 使用 USB 线连接设备到电脑

### 模拟器
1. 在 DevEco Studio 中打开 `Device Manager`
2. 创建或启动 HarmonyOS 模拟器
3. 等待模拟器完全启动

## 应用功能验证

安装成功后，应用应该具备以下功能：

### ✅ 基础功能
- [x] 启动后显示计算器界面（React 应用）
- [x] 基本数学运算（+、-、×、÷）
- [x] 清除和删除功能
- [x] 结果显示

### ✅ 语音功能
- [x] 点击数字和运算符时语音播报
- [x] 计算结果语音播报
- [x] 支持中文数字转换

### ✅ 音频功能
- [x] 背景音乐播放控制
- [x] 音效播放
- [x] 音量控制

### ✅ 数据存储
- [x] 计算历史记录
- [x] 用户设置保存
- [x] 应用状态持久化

## 故障排除

### 1. 设备未检测到
```bash
# 检查设备连接
hdc list targets

# 如果为空，检查：
# - USB 线是否正常连接
# - 设备是否开启开发者模式
# - 是否信任此电脑
```

### 2. 安装失败
```bash
# 卸载旧版本
hdc uninstall com.example.chamath

# 重新安装
hdc install entry/build/default/outputs/default/entry-default-signed.hap
```

### 3. 应用无法启动
```bash
# 检查应用是否已安装
hdc shell bm dump -a

# 手动启动应用
hdc shell aa start -a EntryAbility -b com.example.chamath
```

### 4. 功能异常
- 检查设备是否支持 WebView
- 确认网络权限已授予
- 检查音频权限设置

## 开发调试

### 查看日志
```bash
# 查看应用日志
hdc hilog | grep chamath

# 查看系统日志
hdc hilog
```

### 性能监控
```bash
# 查看应用进程
hdc shell ps | grep chamath

# 查看内存使用
hdc shell cat /proc/meminfo
```

## 注意事项

1. **设备兼容性**：确保设备支持 HarmonyOS 3.1 或更高版本
2. **权限设置**：首次运行时需要授予网络和音频权限
3. **存储空间**：确保设备有足够的存储空间（至少 50MB）
4. **网络连接**：某些功能可能需要网络连接

## 联系支持

如果遇到安装或运行问题，请检查：
1. DevEco Studio 版本是否最新
2. HarmonyOS SDK 是否完整安装
3. 设备系统版本是否兼容
4. 项目构建是否成功

---

**项目构建时间**：最新构建  
**支持的 HarmonyOS 版本**：3.1+  
**应用包名**：com.example.chamath  
**应用版本**：1.0.0