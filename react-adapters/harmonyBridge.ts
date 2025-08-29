/**
 * 鸿蒙桥接适配器
 * 为React应用提供与鸿蒙原生功能的桥接接口
 */

export interface HarmonyBridge {
  // 音频接口
  audio: {
    playNumber: (number: number) => void;
    playOperator: (operator: string) => void;
    playDelete: () => void;
    setVolume: (volume: number) => void;
  };
  
  // 存储接口
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
  
  // 语音识别接口
  voice: {
    startRecognition: () => void;
    stopRecognition: () => void;
  };
  
  // 设备接口
  device: {
    getPlatform: () => string;
    getVersion: () => string;
    requestPermission: (permission: string) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    HarmonyBridge?: HarmonyBridge;
  }
}

/**
 * 鸿蒙桥接管理器
 */
export class HarmonyBridgeManager {
  private static instance: HarmonyBridgeManager;
  private bridge: HarmonyBridge | null = null;
  private isReady: boolean = false;
  private readyCallbacks: (() => void)[] = [];
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  private constructor() {
    this.initializeBridge();
  }

  public static getInstance(): HarmonyBridgeManager {
    if (!HarmonyBridgeManager.instance) {
      HarmonyBridgeManager.instance = new HarmonyBridgeManager();
    }
    return HarmonyBridgeManager.instance;
  }

  /**
   * 初始化桥接
   */
  private initializeBridge(): void {
    // 监听桥接就绪事件
    window.addEventListener('HarmonyBridge_ready', () => {
      console.log('HarmonyBridge已就绪');
      this.bridge = window.HarmonyBridge || null;
      this.isReady = true;
      
      // 执行所有等待的回调
      this.readyCallbacks.forEach(callback => callback());
      this.readyCallbacks = [];
      
      // 设置事件监听
      this.setupEventListeners();
    });

    // 检查是否已经就绪
    if (window.HarmonyBridge) {
      this.bridge = window.HarmonyBridge;
      this.isReady = true;
      this.setupEventListeners();
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 音频事件
    window.addEventListener('HarmonyBridge_audioSuccess', (event: any) => {
      this.emitEvent('audioSuccess', event.detail);
    });

    window.addEventListener('HarmonyBridge_audioError', (event: any) => {
      this.emitEvent('audioError', event.detail);
    });

    // 存储事件
    window.addEventListener('HarmonyBridge_storageCallback', (event: any) => {
      this.emitEvent('storageCallback', event.detail);
    });

    // 语音识别事件
    window.addEventListener('HarmonyBridge_voiceResult', (event: any) => {
      this.emitEvent('voiceResult', event.detail);
    });

    window.addEventListener('HarmonyBridge_voiceError', (event: any) => {
      this.emitEvent('voiceError', event.detail);
    });

    // 权限结果事件
    window.addEventListener('HarmonyBridge_permissionResult', (event: any) => {
      this.emitEvent('permissionResult', event.detail);
    });
  }

  /**
   * 等待桥接就绪
   */
  public waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve();
      } else {
        this.readyCallbacks.push(resolve);
      }
    });
  }

  /**
   * 检查是否在鸿蒙环境
   */
  public isHarmonyOS(): boolean {
    return this.isReady && this.bridge !== null;
  }

  /**
   * 获取桥接实例
   */
  public getBridge(): HarmonyBridge | null {
    return this.bridge;
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }
}

// 导出单例实例
export const harmonyBridge = HarmonyBridgeManager.getInstance();


