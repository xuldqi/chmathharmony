import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

class DataStorageManager {
  private static instance: DataStorageManager;
  private prefs: preferences.Preferences | null = null;
  private context: common.UIAbilityContext | null = null;

  static getInstance(): DataStorageManager {
    if (!DataStorageManager.instance) {
      DataStorageManager.instance = new DataStorageManager();
    }
    return DataStorageManager.instance;
  }

  async init(context: common.UIAbilityContext): Promise<void> {
    try {
      this.context = context;
      this.prefs = await preferences.getPreferences(context, 'chmath_prefs');
      console.log('[Storage] 初始化成功');
    } catch (e) {
      console.error('[Storage] 初始化失败:', e);
    }
  }

  async save(key: string, value: string): Promise<void> {
    if (!this.prefs) {
      console.warn('[Storage] 未初始化');
      return;
    }
    try {
      await this.prefs.put(key, value);
      await this.prefs.flush();
      console.log(`[Storage] 保存: ${key} = ${value}`);
    } catch (e) {
      console.error('[Storage] 保存失败:', e);
    }
  }

  async get(key: string, defaultValue: string = ''): Promise<string> {
    if (!this.prefs) {
      return defaultValue;
    }
    try {
      const value = await this.prefs.get(key, defaultValue);
      return value as string;
    } catch (e) {
      console.error('[Storage] 读取失败:', e);
      return defaultValue;
    }
  }

  async saveNumber(key: string, value: number): Promise<void> {
    await this.save(key, value.toString());
  }

  async getNumber(key: string, defaultValue: number = 0): Promise<number> {
    const value = await this.get(key, defaultValue.toString());
    return parseFloat(value) || defaultValue;
  }

  async delete(key: string): Promise<void> {
    if (!this.prefs) return;
    try {
      await this.prefs.delete(key);
      await this.prefs.flush();
      console.log(`[Storage] 删除: ${key}`);
    } catch (e) {
      console.error('[Storage] 删除失败:', e);
    }
  }

  async clear(): Promise<void> {
    if (!this.prefs) return;
    try {
      await this.prefs.clear();
      await this.prefs.flush();
      console.log('[Storage] 清除所有数据');
    } catch (e) {
      console.error('[Storage] 清除失败:', e);
    }
  }
}

export const DataStorage = DataStorageManager.getInstance();
