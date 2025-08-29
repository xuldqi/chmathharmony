import { webview } from '@kit.ArkWeb';
import JSBridge from '../common/bridge/JSBridge';

@Entry
@Component
struct WebContainer {
  webviewController: webview.WebviewController = new webview.WebviewController();
  private jsBridge: JSBridge = new JSBridge();

  build() {
    Column() {
      // 纯净的全屏WebView，不添加任何额外UI元素
      Web({ 
        src: $rawfile('react-app/index.html'),
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
    }
    .width('100%')
    .height('100%')
  }

  private setupBridge(): void {
    // 注入HarmonyOS桥接对象到Web环境
    const bridgeScript = `
      (function() {
        // 确保HarmonyBridge对象存在
        if (!window.HarmonyBridge) {
          window.HarmonyBridge = {};
        }
        
        // 设置桥接回调处理函数
        window.HarmonyBridge._handleNativeCallback = function(data) {
          console.log('收到原生回调:', data);
          
          // 触发自定义事件
          const event = new CustomEvent('HarmonyBridge_' + data.event, {
            detail: data
          });
          window.dispatchEvent(event);
        };
        
        // 发送桥接就绪事件
        const readyEvent = new CustomEvent('HarmonyBridge_ready');
        window.dispatchEvent(readyEvent);
        
        console.log('HarmonyOS桥接已就绪');
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
