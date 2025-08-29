import { useEffect, useCallback, useState } from 'react';
import { harmonyBridge } from './harmonyBridge';

/**
 * 鸿蒙存储Hook
 * 适配localStorage，在鸿蒙环境下使用原生存储功能
 */
export function useHarmonyStorage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeStorage = async () => {
      try {
        await harmonyBridge.waitForReady();
        if (mounted) {
          setIsReady(true);
          console.log('鸿蒙存储系统已就绪');
        }
      } catch (error) {
        console.error('鸿蒙存储系统初始化失败:', error);
      }
    };

    initializeStorage();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * 获取存储项
   */
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge && isReady) {
        console.log(`从鸿蒙存储获取: ${key}`);
        return await bridge.storage.getItem(key);
      } else {
        console.warn('鸿蒙存储不可用，使用localStorage');
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error(`获取存储项失败: ${key}`, error);
      // 回退到localStorage
      return localStorage.getItem(key);
    }
  }, [isReady]);

  /**
   * 设置存储项
   */
  const setItem = useCallback((key: string, value: string) => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge && isReady) {
        console.log(`向鸿蒙存储设置: ${key} = ${value}`);
        bridge.storage.setItem(key, value);
      } else {
        console.warn('鸿蒙存储不可用，使用localStorage');
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`设置存储项失败: ${key}`, error);
      // 回退到localStorage
      localStorage.setItem(key, value);
    }
  }, [isReady]);

  /**
   * 删除存储项
   */
  const removeItem = useCallback((key: string) => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge && isReady) {
        console.log(`从鸿蒙存储删除: ${key}`);
        bridge.storage.removeItem(key);
      } else {
        console.warn('鸿蒙存储不可用，使用localStorage');
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`删除存储项失败: ${key}`, error);
      // 回退到localStorage
      localStorage.removeItem(key);
    }
  }, [isReady]);

  /**
   * 批量获取存储项
   */
  const getBatch = useCallback(async (keys: string[]): Promise<Record<string, string | null>> => {
    const result: Record<string, string | null> = {};
    
    for (const key of keys) {
      result[key] = await getItem(key);
    }
    
    return result;
  }, [getItem]);

  /**
   * 批量设置存储项
   */
  const setBatch = useCallback((items: Record<string, string>) => {
    for (const [key, value] of Object.entries(items)) {
      setItem(key, value);
    }
  }, [setItem]);

  return {
    isReady,
    getItem,
    setItem,
    removeItem,
    getBatch,
    setBatch
  };
}

/**
 * 统一的存储接口Hook
 * 自动选择最佳的存储方案
 */
export function useStorage() {
  const harmonyStorage = useHarmonyStorage();
  const [isHarmonyOS, setIsHarmonyOS] = useState(false);

  useEffect(() => {
    setIsHarmonyOS(harmonyBridge.isHarmonyOS());
  }, [harmonyStorage.isReady]);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (isHarmonyOS) {
      return await harmonyStorage.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  }, [isHarmonyOS, harmonyStorage]);

  const setItem = useCallback((key: string, value: string) => {
    if (isHarmonyOS) {
      harmonyStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }, [isHarmonyOS, harmonyStorage]);

  const removeItem = useCallback((key: string) => {
    if (isHarmonyOS) {
      harmonyStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }, [isHarmonyOS, harmonyStorage]);

  return {
    isReady: isHarmonyOS ? harmonyStorage.isReady : true,
    isHarmonyOS,
    getItem,
    setItem,
    removeItem,
    getBatch: harmonyStorage.getBatch,
    setBatch: harmonyStorage.setBatch
  };
}


