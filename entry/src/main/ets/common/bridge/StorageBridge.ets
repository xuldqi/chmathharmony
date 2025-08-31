import StorageManager from '../managers/StorageManager';

/**
 * 存储消息数据接口
 */
interface StorageMessageData {
  key?: string;
  value?: string;
  requestId?: string;
}

/**
 * 回调数据接口
 */
interface StorageCallbackData {
  event: string;
  requestId?: string;
  result?: boolean | string | number | string[] | null;
  error?: string;
  action?: string;
  data?: StorageMessageData;
}

/**
 * 存储桥接类
 * 处理Web端数据存储请求
 */
export default class StorageBridge {
  private storageManager: StorageManager = new StorageManager();
  private sendToWeb: ((data: StorageCallbackData) => void) | null = null;

  /**
   * 初始化存储桥接
   * @param sendCallback 向Web发送消息的回调函数
   */
  init(sendCallback: (data: StorageCallbackData) => void): void {
    this.sendToWeb = sendCallback;
    this.storageManager.init();
    console.info('StorageBridge初始化完成');
  }

  /**
   * 处理来自Web的存储消息
   * @param action 操作类型
   * @param data 数据
   */
  async handleMessage(action: string, data: Record<string, string | number | boolean>): Promise<void> {
    try {
      switch (action) {
        case 'storage_getItem':
          if (data.key && typeof data.key === 'string' && data.requestId && typeof data.requestId === 'string') {
            await this.getItem(data.key, data.requestId);
          }
          break;
        case 'storage_setItem':
          if (data.key && typeof data.key === 'string' && data.value && typeof data.value === 'string') {
            await this.setItem(data.key, data.value);
          }
          break;
        case 'storage_removeItem':
          if (data.key && typeof data.key === 'string') {
            await this.removeItem(data.key);
          }
          break;
        case 'storage_clear':
          await this.clear();
          break;
        case 'storage_getAllKeys':
          if (data.requestId && typeof data.requestId === 'string') {
            await this.getAllKeys(data.requestId);
          }
          break;
        default:
          console.warn(`未知的存储操作: ${action}`);
      }
    } catch (error) {
      console.error(`存储操作失败: ${action}`, JSON.stringify(error));
      this.sendError(action, error instanceof Error ? error.message : String(error), typeof data.requestId === 'string' ? data.requestId : undefined);
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param requestId 请求ID
   */
  private async getItem(key: string, requestId: string): Promise<void> {
    console.info(`获取存储项: ${key}`);
    
    try {
      const value = await this.storageManager.getItem(key);
      this.sendCallback(requestId, value);
    } catch (error) {
      console.error(`获取存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`获取存储项失败: ${key}`);
    }
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   */
  private async setItem(key: string, value: string): Promise<void> {
    console.info(`设置存储项: ${key}`);
    
    try {
      await this.storageManager.setItem(key, value);
      const successData: StorageMessageData = { key, value };
      this.sendSuccess('storage_setItem', successData);
    } catch (error) {
      console.error(`设置存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`获取存储项失败: ${key}`);
    }
  }

  /**
   * 删除存储项
   * @param key 键名
   */
  private async removeItem(key: string): Promise<void> {
    console.info(`删除存储项: ${key}`);
    
    try {
      await this.storageManager.removeItem(key);
      const successData: StorageMessageData = { key };
      this.sendSuccess('storage_removeItem', successData);
    } catch (error) {
      console.error(`删除存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`获取存储项失败: ${key}`);
    }
  }

  /**
   * 清空所有存储
   */
  private async clear(): Promise<void> {
    console.info('清空所有存储');
    
    try {
      await this.storageManager.clear();
      const successData: StorageMessageData = {};
      this.sendSuccess('storage_clear', successData);
    } catch (error) {
      console.error('清空存储失败', JSON.stringify(error));
      throw new Error('清空存储失败');
    }
  }

  /**
   * 获取所有键名
   * @param requestId 请求ID
   */
  private async getAllKeys(requestId: string): Promise<void> {
    console.info('获取所有键名');
    
    try {
      const keys = await this.storageManager.getAllKeys();
      this.sendCallback(requestId, keys);
    } catch (error) {
      console.error('获取所有键名失败', JSON.stringify(error));
      throw new Error('获取所有键名失败');
    }
  }

  /**
   * 发送回调结果到Web
   * @param requestId 请求ID
   * @param result 结果
   */
  private sendCallback(requestId: string, result: string | string[] | null): void {
    if (this.sendToWeb) {
      const callbackData: StorageCallbackData = {
        requestId: requestId,
        result: result,
        event: 'storageCallback'
      };
      this.sendToWeb(callbackData);
    }
  }

  /**
   * 发送成功消息到Web
   * @param action 操作类型
   * @param data 数据
   */
  private sendSuccess(action: string, data: StorageMessageData): void {
    if (this.sendToWeb) {
      const successData: StorageCallbackData = {
        event: 'storageSuccess',
        action: action,
        data: data
      };
      this.sendToWeb(successData);
    }
  }

  /**
   * 发送错误消息到Web
   * @param action 操作类型
   * @param error 错误信息
   * @param requestId 请求ID（可选）
   */
  private sendError(action: string, error: string, requestId?: string): void {
    if (this.sendToWeb) {
      const errorData: StorageCallbackData = {
        event: 'storageError',
        action: action,
        error: error,
        requestId: requestId
      };
      this.sendToWeb(errorData);
    }
  }

  /**
   * 销毁存储桥接
   */
  destroy(): void {
    this.storageManager.destroy();
    this.sendToWeb = null;
    console.info('StorageBridge已销毁');
  }
}



