# 儿童语音计算器 - HarmonyOS版本

这是一个基于HarmonyOS的儿童语音计算器应用，采用混合架构设计，结合了原生HarmonyOS功能和React Web技术。

## 🏗️ 项目架构

### 混合架构设计
- **原生层 (HarmonyOS/ArkTS)**: 负责应用入口、权限管理、音频播放、语音识别等原生功能
- **Web层 (React)**: 负责用户界面、计算逻辑、动画效果等前端功能
- **通信层 (JSBridge)**: 实现原生与Web之间的双向通信

### 目录结构
```
chamath/
├── entry/                          # HarmonyOS主模块
│   └── src/main/
│       ├── ets/                    # ArkTS源码
│       │   ├── pages/              # 页面组件
│       │   │   ├── Index.ets       # 主页面
│       │   │   └── WebContainer.ets # WebView容器
│       │   ├── common/             # 公共模块
│       │   │   ├── bridge/         # JSBridge通信
│       │   │   └── managers/       # 管理器
│       │   └── entryability/       # 应用入口
│       └── resources/
│           └── rawfile/
│               └── react-app/      # React Web应用
├── react-app/                      # React应用源码
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 快速开始

### 环境要求
- DevEco Studio 4.0+
- HarmonyOS SDK 5.0+
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
# 安装React应用依赖
cd react-app
npm install

# 构建React应用到HarmonyOS资源目录
npm run build:web
```

### 构建HarmonyOS应用
```bash
# 在项目根目录
hvigorw assembleHap
```

### 运行应用
1. 在DevEco Studio中打开项目
2. 连接HarmonyOS设备或启动模拟器
3. 点击运行按钮

## 🎯 功能特性

### 核心功能
- ✅ 基础计算器功能
- ✅ 语音识别输入
- ✅ 数字语音播放
- ✅ 运算符语音播放
- ✅ 数据持久化存储
- ✅ 响应式界面设计

### 技术特性
- 🔄 混合架构 (Native + Web)
- 🌐 JSBridge双向通信
- 🎵 原生音频管理
- 🎤 原生语音识别
- 💾 本地数据存储
- 📱 跨平台兼容

## 🔧 开发指南

### JSBridge通信
```javascript
// Web端调用原生功能
window.HarmonyBridge.audio.playNumber(5);
window.HarmonyBridge.storage.setItem('key', 'value');

// 原生端发送消息到Web
jsBridge.sendMessage('audioSuccess', { number: 5 });
```

### 添加新的原生功能
1. 在`common/managers/`中创建管理器
2. 在`common/bridge/`中创建Bridge
3. 在JSBridge中注册新功能
4. 在Web端添加对应的接口

### 自定义样式
- React应用使用Tailwind CSS
- 原生界面使用ArkUI
- 支持主题切换和深色模式

## 📱 平台支持

- ✅ HarmonyOS 5.0+
- ✅ 手机设备
- ✅ 平板设备
- 🔄 其他平台 (通过ArkUI-X)

## 🐛 故障排除

### 常见问题

1. **SDK组件缺失**
   - 检查DevEco Studio SDK配置
   - 重新安装HarmonyOS SDK

2. **WebView加载失败**
   - 检查React应用构建
   - 验证资源文件路径

3. **语音识别不工作**
   - 检查麦克风权限
   - 确认设备支持语音识别

4. **音频播放失败**
   - 检查音频文件路径
   - 验证音频格式支持

### 调试技巧
- 使用DevEco Studio调试器
- 查看WebView控制台日志
- 检查JSBridge通信日志

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: [your-email@example.com]

---

**注意**: 这是一个实验性项目，部分功能可能仍在开发中。请在生产环境中谨慎使用。
