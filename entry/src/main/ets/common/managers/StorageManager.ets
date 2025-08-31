import { preferences } from '@kit.ArkData';
import { BusinessError } from '@kit.BasicServicesKit';

/**
 * 存储管理器
 * 负责应用数据的持久化存储
 */
export default class StorageManager {
  private preferences: preferences.Preferences | null = null;
  private isInitialized: boolean = false;
  private readonly PREFERENCES_NAME = 'chmath_preferences';

  /**
   * 初始化存储管理器
   */
  async init(): Promise<void> {
    console.info('StorageManager初始化开始');
    
    try {
      const context = getContext(this);
      this.preferences = await preferences.getPreferences(context, this.PREFERENCES_NAME);
      this.isInitialized = true;
      console.info('StorageManager初始化完成');
    } catch (error) {
      console.error('StorageManager初始化失败', JSON.stringify(error));
      throw new Error('StorageManager初始化失败');
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @returns 值，如果不存在则返回null
   */
  async getItem(key: string): Promise<string | null> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const value = await this.preferences.get(key, null);
      console.info(`获取存储项成功: ${key} = ${value}`);
      if (value === null) {
        return null;
      }
      return String(value);
    } catch (error) {
      console.error(`获取存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`获取存储项失败: ${key}`);
    }
  }

  /**
   * 设置存储项
   *
   * @param key 键名
   * @param value 值
   */
  async setItem(key: string, value: string): Promise<void> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      await this.preferences.put(key, value);
      await this.preferences.flush(); // 立即持久化
      console.info(`设置存储项成功: ${key} = ${value}`);
    } catch (error) {
      console.error(`设置存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`设置存储项失败: ${key}`);
    }
  }

  /**
   * 删除存储项
   * @param key 键名
   */
  async removeItem(key: string): Promise<void> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      await this.preferences.delete(key);
      await this.preferences.flush();
      console.info(`删除存储项成功: ${key}`);
    } catch (error) {
      console.error(`删除存储项失败: ${key}`, JSON.stringify(error));
      throw new Error(`删除存储项失败: ${key}`);
    }
  }

  /**
   * 清空所有存储项
   */
  async clear(): Promise<void> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      await this.preferences.clear();
      await this.preferences.flush();
      console.info('清空所有存储项成功');
    } catch (error) {
      console.error('清空存储项失败', JSON.stringify(error));
      throw new Error('清空存储项失败');
    }
  }

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const keys = await this.preferences.getAll();
      const keyArray = Object.keys(keys);
      console.info(`获取所有键名成功: ${keyArray.length}个键`);
      return keyArray;
    } catch (error) {
      console.error('获取所有键名失败', JSON.stringify(error));
      throw new Error('获取所有键名失败');
    }
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @returns 是否存在
   */
  async hasKey(key: string): Promise<boolean> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const value = await this.preferences.get(key, undefined);
      return value !== undefined;
    } catch (error) {
      console.error(`检查键是否存在失败: ${key}`, JSON.stringify(error));
      return false;
    }
  }

  /**
   * 获取存储大小（键值对数量）
   * @returns 存储项数量
   */
  async getSize(): Promise<number> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const all = await this.preferences.getAll();
      return Object.keys(all).length;
    } catch (error) {
      console.error('获取存储大小失败', JSON.stringify(error));
      throw new Error('获取存储大小失败');
    }
  }

  /**
   * 批量设置存储项
   * @param items 键值对对象
   */
  async setBatch(items: Record<string, string>): Promise<void> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const keys = Object.keys(items);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = items[key];
        await this.preferences.put(key, value);
      }
      await this.preferences.flush();
      console.info(`批量设置存储项成功: ${Object.keys(items).length}个项`);
    } catch (error) {
      console.error('批量设置存储项失败', JSON.stringify(error));
      throw new Error('批量设置存储项失败');
    }
  }

  /**
   * 批量获取存储项
   * @param keys 键名数组
   * @returns 键值对对象
   */
  async getBatch(keys: string[]): Promise<Record<string, string | null>> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const result: Record<string, string | null> = {};
      for (const key of keys) {
        const value = await this.preferences.get(key, null);
        result[key] = value === null ? null : String(value);
      }
      console.info(`批量获取存储项成功: ${keys.length}个项`);
      return result;
    } catch (error) {
      console.error('批量获取存储项失败', JSON.stringify(error));
      throw new Error('批量获取存储项失败');
    }
  }

  /**
   * 导出所有数据
   * @returns 所有键值对
   */
  async exportData(): Promise<Record<string, string | number | boolean>> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      const allData = await this.preferences.getAll();
      console.info(`导出数据成功: ${Object.keys(allData).length}个项`);
      // 转换为正确的类型 - 直接返回原始对象并进行类型断言
      return allData as Record<string, string | number | boolean>;
    } catch (error) {
      console.error('导出数据失败', JSON.stringify(error));
      throw new Error('导出数据失败');
    }
  }

  /**
   * 导入数据
   * @param data 要导入的数据
   */
  async importData(data: Record<string, string | number | boolean>): Promise<void> {
    if (!this.isInitialized || !this.preferences) {
      throw new Error('StorageManager未初始化');
    }

    try {
      // 清空现有数据
      await this.preferences.clear();
      
      // 导入新数据
      const keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = data[key];
        await this.preferences.put(key, value);
      }
      
      await this.preferences.flush();
      console.info(`导入数据成功: ${Object.keys(data).length}个项`);
    } catch (error) {
      console.error('导入数据失败', JSON.stringify(error));
      throw new Error('导入数据失败');
    }
  }

  /**
   * 销毁存储管理器
   */
  destroy(): void {
    this.preferences = null;
    this.isInitialized = false;
    console.info('StorageManager已销毁');
  }
}
