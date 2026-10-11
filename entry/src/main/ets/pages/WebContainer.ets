import { webview } from '@kit.ArkWeb';
import { router } from '@kit.ArkUI';
import JSBridge from '../common/bridge/JSBridge';

@Entry
@Component
struct WebContainer {
  webviewController: webview.WebviewController = new webview.WebviewController();
  private jsBridge: JSBridge = new JSBridge();
  @State webUrl: Resource = $rawfile('react-app/index.html');
  @State currentRoute: string = '/';

  onPageShow() {
    // 获取传入的路由参数
    const params = router.getParams() as Record<string, string>;
    if (params && params.url) {
      this.currentRoute = params.url;
      // 使用 webUrl 作为 Resource，路由信息通过 JavaScript 注入
      console.info('WebContainer 加载路由:', this.currentRoute);
    }
  }

  build() {
    Column() {
      // 纯净的全屏WebView，不添加任何额外UI元素
      Web({ 
        src: this.webUrl,
        controller: this.webviewController 
      })
        .width('100%')
        .height('100%')
        .onPageBegin(() => {
          console.info('Web页面开始加载');
          // 初始化JSBridge
          this.jsBridge.init(this.webviewController);
        })
        .onPageEnd(() => {
          console.info('Web页面加载完成');
          // 页面加载完成后设置桥接
          this.setupBridge();
        })
        .onErrorReceive((event) => {
          console.error('Web页面加载错误:', JSON.stringify(event));
        })
        .javaScriptAccess(true)
        .zoomAccess(true)
        .domStorageAccess(true)  // 启用 DOM Storage
        // .databaseAccess(true)     // 启用数据库 - 跨平台兼容性问题
        .cacheMode(CacheMode.Default)
        .onConsole((event) => {
          // 监听 console 消息
          const message = event?.message?.getMessage() || '';
          console.info('[WebView Console]', message);
          return false;
        })
        .onPrompt((event) => {
          // 处理来自 Web 端的 prompt 调用
          const message = event?.message || '';
          console.info('[WebView Prompt]', message);
          
          // 检查是否是桥接消息
          if (message.startsWith('__HARMONY_BRIDGE__')) {
            const bridgeMessage = message.substring('__HARMONY_BRIDGE__'.length);
            const result = this.jsBridge.processWebMessage(bridgeMessage);
            
            // 如果有同步结果，返回给 Web 端
            if (result) {
              return true;
            }
            // 对于异步操作，返回 false 使用默认行为
            return false;
          }
          
          // 其他 prompt 调用使用默认行为
          return false;
        })
    }
    .width('100%')
    .height('100%')
  }

  private setupBridge(): void {
    // 注入HarmonyOS桥接对象到Web环境
    const bridgeScript = `
      (function() {
        'use strict';
        
        // 请求ID计数器
        let requestIdCounter = 0;
        
        // 待处理的Promise回调
        const pendingCallbacks = new Map();
        
        // 生成唯一请求ID
        function generateRequestId() {
          return 'req_' + (++requestIdCounter) + '_' + Date.now();
        }
        
        // 处理原生回调
        function handleNativeCallback(data) {
          console.log('[HarmonyBridge] 收到原生回调:', JSON.stringify(data));
          
          // 触发自定义事件
          if (data && data.event) {
            const event = new CustomEvent('HarmonyBridge_' + data.event, {
              detail: data
            });
            window.dispatchEvent(event);
          }
          
          // 处理Promise回调
          if (data && data.requestId) {
            const callback = pendingCallbacks.get(data.requestId);
            if (callback) {
              pendingCallbacks.delete(data.requestId);
              if (data.error) {
                callback.reject(new Error(data.error));
              } else {
                callback.resolve(data.result);
              }
            }
          }
        }
        
        // 通过 prompt 与原生通信（HarmonyOS WebView 支持）
        function sendToNative(action, data) {
          const requestId = generateRequestId();
          const message = JSON.stringify({
            action: action,
            requestId: requestId,
            ...data
          });
          
          console.log('[HarmonyBridge] 发送消息:', action);
          
          // 返回 Promise
          return new Promise((resolve, reject) => {
            pendingCallbacks.set(requestId, { resolve, reject });
            
            // 使用 prompt 发送消息
            const result = prompt('__HARMONY_BRIDGE__' + message, '');
            
            // 如果 prompt 返回了结果（同步响应）
            if (result && result !== '') {
              try {
                const response = JSON.parse(result);
                pendingCallbacks.delete(requestId);
                if (response.error) {
                  reject(new Error(response.error));
                } else {
                  resolve(response.result);
                }
              } catch (e) {
                // 异步响应，等待回调
              }
            }
            
            // 设置超时
            setTimeout(() => {
              if (pendingCallbacks.has(requestId)) {
                pendingCallbacks.delete(requestId);
                reject(new Error('请求超时'));
              }
            }, 10000);
          });
        }
        
        // 创建HarmonyBridge对象
        window.HarmonyBridge = {
          // 回调处理
          _handleNativeCallback: handleNativeCallback,
          
          // 音频接口
          audio: {
            playNumber: function(number) {
              console.log('[HarmonyBridge] playNumber:', number);
              sendToNative('audio_playNumber', { number: number });
            },
            playOperator: function(operator) {
              console.log('[HarmonyBridge] playOperator:', operator);
              sendToNative('audio_playOperator', { operator: operator });
            },
            playDelete: function() {
              console.log('[HarmonyBridge] playDelete');
              sendToNative('audio_playDelete', {});
            },
            setVolume: function(volume) {
              console.log('[HarmonyBridge] setVolume:', volume);
              sendToNative('audio_setVolume', { volume: volume });
            }
          },
          
          // 存储接口
          storage: {
            getItem: function(key) {
              console.log('[HarmonyBridge] storage.getItem:', key);
              return sendToNative('storage_getItem', { key: key });
            },
            setItem: function(key, value) {
              console.log('[HarmonyBridge] storage.setItem:', key);
              sendToNative('storage_setItem', { key: key, value: value });
            },
            removeItem: function(key) {
              console.log('[HarmonyBridge] storage.removeItem:', key);
              sendToNative('storage_removeItem', { key: key });
            },
            clear: function() {
              console.log('[HarmonyBridge] storage.clear');
              sendToNative('storage_clear', {});
            },
            getAllKeys: function() {
              console.log('[HarmonyBridge] storage.getAllKeys');
              return sendToNative('storage_getAllKeys', {});
            }
          },
          
          // 语音识别接口
          voice: {
            startRecognition: function() {
              console.log('[HarmonyBridge] voice.startRecognition');
              return sendToNative('voice_startRecognition', {});
            },
            stopRecognition: function() {
              console.log('[HarmonyBridge] voice.stopRecognition');
              sendToNative('voice_stopRecognition', {});
            },
            checkPermission: function() {
              console.log('[HarmonyBridge] voice.checkPermission');
              return sendToNative('voice_checkPermission', {});
            }
          },
          
          // 设备接口
          device: {
            getPlatform: function() {
              return 'harmonyos';
            },
            getVersion: function() {
              return '1.0.0';
            },
            requestPermission: function(permission) {
              console.log('[HarmonyBridge] device.requestPermission:', permission);
              return sendToNative('device_requestPermission', { permission: permission });
            }
          }
        };
        
        // 发送桥接就绪事件
        console.log('[HarmonyBridge] 桥接已就绪');
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('HarmonyBridge_ready'));
        }, 100);
        
      })();
    `;
    
    this.webviewController.runJavaScript(bridgeScript)
      .then(() => {
        console.info('桥接脚本注入成功');
      })
      .catch((error: Error) => {
        console.error('桥接脚本注入失败:', JSON.stringify(error));
      });
  }

  aboutToDisappear(): void {
    // 清理资源
    this.jsBridge.destroy();
  }
}
