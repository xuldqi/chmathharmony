import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chmath.app',
  appName: '语音计算器',
  webDir: 'dist',
  android: {
    buildOptions: {
      sourceCompatibility: 'VERSION_17',
      targetCompatibility: 'VERSION_17',
      javaVersion: '17'
    }
  },
  ios: {
    scheme: 'ChMath',
    contentInset: 'automatic',
    // 优化WebView性能
    webContentsDebuggingEnabled: false,
    // 预加载WebView
    allowsLinkPreview: false,
    // 优化滚动性能
    scrollEnabled: true
  },
  server: {
    // 开发环境配置，生产环境会被忽略
    androidScheme: 'https'
  }
};

export default config;
