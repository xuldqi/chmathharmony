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
    speakText: (text: string) => void;
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

type BridgeEventCallback = (data: unknown) => void;

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
  private eventListeners: Map<string, BridgeEventCallback[]> = new Map();

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
    const getEventDetail = (event: Event): unknown => {
      if ('detail' in event) {
        return (event as CustomEvent<unknown>).detail;
      }
      return undefined;
    };

    // 音频事件
    window.addEventListener('HarmonyBridge_audioSuccess', (event: Event) => {
      this.emitEvent('audioSuccess', getEventDetail(event));
    });

    window.addEventListener('HarmonyBridge_audioError', (event: Event) => {
      this.emitEvent('audioError', getEventDetail(event));
    });

    // 存储事件
    window.addEventListener('HarmonyBridge_storageCallback', (event: Event) => {
      this.emitEvent('storageCallback', getEventDetail(event));
    });

    // 语音识别事件
    window.addEventListener('HarmonyBridge_voiceResult', (event: Event) => {
      this.emitEvent('voiceResult', getEventDetail(event));
    });

    window.addEventListener('HarmonyBridge_voiceError', (event: Event) => {
      this.emitEvent('voiceError', getEventDetail(event));
    });

    window.addEventListener('HarmonyBridge_voiceEvent', (event: Event) => {
      this.emitEvent('voiceEvent', getEventDetail(event));
    });

    window.addEventListener('HarmonyBridge_voicePermission', (event: Event) => {
      this.emitEvent('voicePermission', getEventDetail(event));
    });

    // 权限结果事件
    window.addEventListener('HarmonyBridge_permissionResult', (event: Event) => {
      this.emitEvent('permissionResult', getEventDetail(event));
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
  public addEventListener(event: string, callback: BridgeEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: string, callback: BridgeEventCallback): void {
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
  private emitEvent(event: string, data: unknown): void {
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
