import { webview } from '@kit.ArkWeb';
import { BusinessError } from '@kit.BasicServicesKit';
import AudioBridge from './AudioBridge';
import StorageBridge from './StorageBridge';
import VoiceBridge from './VoiceBridge';

// 导入各个 Bridge 的回调数据类型
interface JSAudioCallbackData {
  event: string;
  action?: string;
  result?: boolean | string | number | string[] | null;
  error?: string;
  data?: Record<string, string | number | boolean>;
}

interface JSStorageCallbackData {
  event: string;
  requestId?: string;
  result?: boolean | string | number | string[] | null;
  error?: string;
  action?: string;
}

interface JSVoiceCallbackData {
  event: string;
  requestId?: string;
  result?: boolean | string | number | string[] | null;
  error?: string;
  action?: string;
}

/**
 * 桥接消息数据接口
 */
interface BridgeMessageData {
  permission?: string;
  requestId?: string;
  number?: number;
  operator?: string;
  volume?: number;
  key?: string;
  value?: string;
  keys?: string[];
  recognizeText?: string;
}

/**
 * 音频消息数据接口
 */
interface AudioMessageData {
  number?: number;
  operator?: string;
  volume?: number;
}

/**
 * 存储消息数据接口
 */
interface StorageMessageData {
  key?: string;
  value?: string;
  requestId?: string;
}

/**
 * 语音消息数据接口
 */
interface VoiceMessageData extends Record<string, string | number | boolean> {
}

/**
 * 回调数据接口
 */
interface JSCallbackData {
  event: string;
  requestId?: string;
  result?: boolean | string | number | string[] | null;
  error?: string;
  action?: string;
  data?: BridgeMessageData;
}

/**
 * 设备权限数据接口
 */
interface PermissionData {
  permission: string;
  requestId: string;
}

/**
 * JSBridge核心类
 * 负责Web与Native之间的通信桥梁
 */
export default class JSBridge {
  private webviewController: webview.WebviewController | null = null;
  private audioBridge: AudioBridge = new AudioBridge();
  private storageBridge: StorageBridge = new StorageBridge();
  private voiceBridge: VoiceBridge = new VoiceBridge();
  private isInitialized: boolean = false;

  /**
   * 初始化JSBridge
   * @param controller WebView控制器
   */
  init(controller: webview.WebviewController): void {
    this.webviewController = controller;
    this.setupMessageHandler();
    this.initializeBridges();
    this.isInitialized = true;
    console.info('JSBridge初始化完成');
  }

  /**
   * 设置消息处理器
   */
  private setupMessageHandler(): void {
    if (!this.webviewController) {
      console.error('WebView控制器未初始化');
      return;
    }

    // 注册原生方法供JavaScript调用（仅在非跨平台模式下）
    console.info('JSBridge消息处理器已设置，使用JavaScript注入方式通信');
  }

  /**
   * 初始化各个子Bridge
   */
  private initializeBridges(): void {
    // 初始化各个Bridge
    this.audioBridge.init((data) => {
       this.sendToWeb(data as JSCallbackData);
     });
     this.storageBridge.init((data) => {
       this.sendToWeb(data as JSCallbackData);
     });
     this.voiceBridge.init((data) => {
       this.sendToWeb(data as JSCallbackData);
     });
  }

  /**
   * 处理来自Web的消息
   * @param action 操作类型
   * @param data 数据
   */
  private handleMessage(action: string, data: BridgeMessageData): void {
    console.info(`JSBridge收到消息: ${action}`, JSON.stringify(data));

    try {
      // 根据action类型分发到对应的Bridge
      if (action.startsWith('audio_')) {
        this.audioBridge.handleMessage(action, data as Record<string, string | number | boolean>);
      } else if (action.startsWith('storage_')) {
        this.storageBridge.handleMessage(action, data as Record<string, string | number | boolean>);
      } else if (action.startsWith('voice_')) {
        this.voiceBridge.handleMessage(action, data as Record<string, string | number | boolean>);
      } else if (action.startsWith('device_')) {
        this.handleDeviceMessage(action, data);
      } else {
        console.warn(`未知的消息类型: ${action}`);
      }
    } catch (error) {
      console.error(`处理消息失败: ${action}`, JSON.stringify(error));
      this.sendErrorToWeb(action, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 处理设备相关消息
   * @param action 操作类型
   * @param data 数据
   */
  private handleDeviceMessage(action: string, data: BridgeMessageData): void {
    switch (action) {
      case 'device_requestPermission':
        if (data.permission && data.requestId) {
          this.requestPermission(data.permission, data.requestId);
        }
        break;
      default:
        console.warn(`未知的设备操作: ${action}`);
    }
  }

  /**
   * 请求权限
   * @param permission 权限类型
   * @param requestId 请求ID
   */
  private async requestPermission(permission: string, requestId: string): Promise<void> {
    try {
      // 这里实现具体的权限请求逻辑
      let granted = false;
      
      switch (permission) {
        case 'microphone':
          // 请求麦克风权限
          granted = await this.requestMicrophonePermission();
          break;
        case 'storage':
          // 请求存储权限
          granted = await this.requestStoragePermission();
          break;
        default:
          console.warn(`未支持的权限类型: ${permission}`);
      }

      const successResult: JSCallbackData = {
        requestId,
        result: granted,
        event: 'permissionResult'
      };
      this.sendToWeb(successResult);
    } catch (error) {
      console.error(`请求权限失败: ${permission}`, JSON.stringify(error));
      const errorResult: JSCallbackData = {
        requestId,
        result: false,
        error: error instanceof Error ? error.message : String(error),
        event: 'permissionResult'
      };
      this.sendToWeb(errorResult);
    }
  }

  /**
   * 请求麦克风权限
   */
  private async requestMicrophonePermission(): Promise<boolean> {
    // TODO: 实现麦克风权限请求
    return true;
  }

  /**
   * 请求存储权限
   */
  private async requestStoragePermission(): Promise<boolean> {
    // TODO: 实现存储权限请求
    return true;
  }

  /**
   * 向Web发送消息
   * @param data 要发送的数据
   */
  sendToWeb(data: JSCallbackData): void {
    if (!this.webviewController || !this.isInitialized) {
      console.error('JSBridge未初始化');
      return;
    }

    const script = `
      (function() {
        if (window.HarmonyBridge && window.HarmonyBridge._handleNativeCallback) {
          window.HarmonyBridge._handleNativeCallback(${JSON.stringify(data)});
        } else {
          console.warn('HarmonyBridge未就绪，消息将被忽略:', ${JSON.stringify(data)});
        }
      })();
    `;

    this.webviewController.runJavaScript(script)
      .then(() => {
        console.info('消息发送成功:', JSON.stringify(data));
      })
      .catch((error: BusinessError) => {
        console.error('消息发送失败:', JSON.stringify(error));
      });
  }

  /**
   * 向Web发送错误消息
   * @param action 操作类型
   * @param error 错误信息
   */
  private sendErrorToWeb(action: string, error: string): void {
    const errorData: JSCallbackData = {
      event: 'error',
      action: action,
      error: error
    };
    this.sendToWeb(errorData);
  }

  /**
   * 销毁JSBridge
   */
  destroy(): void {
    this.audioBridge.destroy();
    this.storageBridge.destroy();
    this.voiceBridge.destroy();
    this.webviewController = null;
    this.isInitialized = false;
    console.info('JSBridge已销毁');
  }
}
