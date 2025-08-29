import { webview } from '@kit.ArkWeb';
import { BusinessError } from '@kit.BasicServicesKit';
import AudioBridge from './AudioBridge';
import StorageBridge from './StorageBridge';
import VoiceBridge from './VoiceBridge';

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
 * 回调数据接口
 */
interface CallbackData {
  event: string;
  requestId?: string;
  result?: boolean | string | number | string[] | null;
  error?: Error;
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
    // 设置回调函数，用于向Web发送消息
    this.audioBridge.init(this.audioCallback);
    this.storageBridge.init(this.storageCallback);
    this.voiceBridge.init(this.voiceCallback);
  }
  
  /**
   * 音频桥接回调函数
   */
  private audioCallback = (data: CallbackData): void => {
    this.sendToWeb(data);
  }
  
  /**
   * 存储桥接回调函数
   */
  private storageCallback = (data: CallbackData): void => {
    this.sendToWeb(data);
  }
  
  /**
   * 语音桥接回调函数
   */
  private voiceCallback = (data: CallbackData): void => {
    this.sendToWeb(data);
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
        this.audioBridge.handleMessage(action, data);
      } else if (action.startsWith('storage_')) {
        this.storageBridge.handleMessage(action, data);
      } else if (action.startsWith('voice_')) {
        this.voiceBridge.handleMessage(action, data);
      } else if (action.startsWith('device_')) {
        this.handleDeviceMessage(action, data);
      } else {
        console.warn(`未知的消息类型: ${action}`);
      }
    } catch (error) {
      console.error(`处理消息失败: ${action}`, JSON.stringify(error));
      this.sendErrorToWeb(action, error);
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

      const successResult: CallbackData = {
        requestId,
        result: granted,
        event: 'permissionResult'
      };
      this.sendToWeb(successResult);
    } catch (error) {
      console.error(`请求权限失败: ${permission}`, JSON.stringify(error));
      const errorResult: CallbackData = {
        requestId,
        result: false,
        error: error as Error,
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
  sendToWeb(data: CallbackData): void {
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
  private sendErrorToWeb(action: string, error: Error): void {
    const errorData: CallbackData = {
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
