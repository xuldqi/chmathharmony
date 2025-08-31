import { useEffect, useCallback, useState } from 'react';
import { harmonyBridge } from './harmonyBridge';

/**
 * 鸿蒙音频Hook
 * 适配原有的useAudio Hook，在鸿蒙环境下使用原生音频功能
 */
export function useHarmonyAudio() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAudio = async () => {
      try {
        await harmonyBridge.waitForReady();
        if (mounted) {
          setIsReady(true);
          console.log('鸿蒙音频系统已就绪');
        }
      } catch (error) {
        console.error('鸿蒙音频系统初始化失败:', error);
      }
    };

    initializeAudio();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * 播放数字语音
   */
  const playNumber = useCallback(async (number: number) => {
    if (!isAudioEnabled || !isReady) {
      console.log('音频未启用或未就绪，跳过播放');
      return;
    }

    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        console.log(`播放数字语音: ${number}`);
        bridge.audio.playNumber(number);
      } else {
        console.warn('鸿蒙桥接不可用，尝试使用Web音频');
        // 这里可以回退到Web音频播放
        await playWebAudio(`num${number}`);
      }
    } catch (error) {
      console.error(`播放数字语音失败: ${number}`, error);
    }
  }, [isAudioEnabled, isReady]);

  /**
   * 播放运算符语音
   */
  const playOperator = useCallback(async (operator: string) => {
    if (!isAudioEnabled || !isReady) {
      console.log('音频未启用或未就绪，跳过播放');
      return;
    }

    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        console.log(`播放运算符语音: ${operator}`);
        bridge.audio.playOperator(operator);
      } else {
        console.warn('鸿蒙桥接不可用，尝试使用Web音频');
        await playWebAudio(getOperatorAudioKey(operator));
      }
    } catch (error) {
      console.error(`播放运算符语音失败: ${operator}`, error);
    }
  }, [isAudioEnabled, isReady]);

  /**
   * 播放删除音效
   */
  const playDelete = useCallback(async () => {
    if (!isAudioEnabled || !isReady) {
      console.log('音频未启用或未就绪，跳过播放');
      return;
    }

    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        console.log('播放删除音效');
        bridge.audio.playDelete();
      } else {
        console.warn('鸿蒙桥接不可用，尝试使用Web音频');
        await playWebAudio('del');
      }
    } catch (error) {
      console.error('播放删除音效失败', error);
    }
  }, [isAudioEnabled, isReady]);

  /**
   * 播放按钮点击音效
   */
  const playButtonClick = useCallback(async () => {
    // 按钮点击使用删除音效作为替代
    await playDelete();
  }, [playDelete]);

  /**
   * 切换音频启用状态
   */
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    console.log('音频状态切换:', !isAudioEnabled);
  }, [isAudioEnabled]);

  /**
   * 设置音量
   */
  const setVolume = useCallback(async (volume: number) => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        bridge.audio.setVolume(volume);
        console.log(`设置音量: ${volume}`);
      }
    } catch (error) {
      console.error(`设置音量失败: ${volume}`, error);
    }
  }, []);

  return {
    isAudioEnabled,
    isReady,
    playNumber,
    playOperator,
    playDelete,
    playButtonClick,
    toggleAudio,
    setVolume
  };
}

/**
 * Web音频播放回退方案
 */
async function playWebAudio(audioKey: string): Promise<void> {
  try {
    const audio = new Audio(`/audio/${audioKey}.ogg`);
    await audio.play();
    console.log(`Web音频播放成功: ${audioKey}`);
  } catch (error) {
    console.warn(`Web音频播放失败: ${audioKey}`, error);
  }
}

/**
 * 获取运算符对应的音频键名
 */
function getOperatorAudioKey(operator: string): string {
  switch (operator) {
    case '+':
    case 'add':
      return 'jia';
    case '-':
    case 'subtract':
      return 'jian';
    case '×':
    case '*':
    case 'multiply':
      return 'chengyi';
    case '÷':
    case '/':
    case 'divide':
      return 'chuyi';
    case '=':
    case 'equal':
      return 'dengyu';
    default:
      return 'del';
  }
}



