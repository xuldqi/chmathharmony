/**
 * 鸿蒙适配器统一导出
 * 提供React应用在鸿蒙环境下的全部适配功能
 */

import { useHarmonyAudio } from './useHarmonyAudio';
import { useHarmonyStorage, useStorage } from './useHarmonyStorage';
import { useHarmonyVoice } from './useHarmonyVoice';
import { harmonyBridge } from './harmonyBridge';

// 平台检测
export const isHarmonyOS = () => {
  return harmonyBridge.isHarmonyOS();
};

// 统一的Hook导出
export const useAudio = () => {
  if (isHarmonyOS()) {
    return useHarmonyAudio();
  } else {
    // 这里应该导入原有的useAudio Hook
    // return useOriginalAudio();
    console.warn('非鸿蒙环境，请使用原有的useAudio Hook');
    return useHarmonyAudio(); // 临时返回，实际应该是原有的Hook
  }
};

export const useVoice = () => {
  return useHarmonyVoice();
};

// 导出具体的适配器
export {
  useHarmonyAudio,
  useHarmonyStorage,
  useStorage,
  useHarmonyVoice,
  harmonyBridge
};

// 类型导出
export type { HarmonyBridge } from './harmonyBridge';


