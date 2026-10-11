// 计算历史记录存储管理器
export interface CalcHistoryItem {
  id: string;
  type: 'standard' | 'scientific' | 'fraction'; // 普通计算、科学计算、分数计算
  expression: string;                           // 算式内容，例如 "2又3/5 + 1/2 ="
  result: string;                               // 计算结果，例如 "3又1/10 (≈ 3.1)"
  timestamp: number;                            // 毫秒时间戳
}

const STORAGE_KEY = 'chmath_calc_history_v1';
const MAX_HISTORY_ITEMS = 200;

export class HistoryStorage {
  /**
   * 获取所有历史记录（按时间倒序）
   */
  static getHistory(): CalcHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.warn('[HistoryStorage] 读取计算历史失败:', e);
      return [];
    }
  }

  /**
   * 添加一条计算历史
   */
  static addRecord(type: 'standard' | 'scientific' | 'fraction', expression: string, result: string): void {
    try {
      if (!expression || !result || result === '错误') return;
      const history = this.getHistory();
      
      const newItem: CalcHistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        expression: expression.trim(),
        result: result.trim(),
        timestamp: Date.now(),
      };

      // 避免重复连续写入相同的算式和结果
      if (history.length > 0 && history[0].expression === newItem.expression && history[0].result === newItem.result) {
        return;
      }

      const nextHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch (e) {
      console.warn('[HistoryStorage] 保存计算历史失败:', e);
    }
  }

  /**
   * 删除单条记录
   */
  static deleteRecord(id: string): void {
    try {
      const history = this.getHistory().filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('[HistoryStorage] 删除记录失败:', e);
    }
  }

  /**
   * 清空全部历史
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[HistoryStorage] 清空历史失败:', e);
    }
  }
}

export default HistoryStorage;
