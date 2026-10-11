import { useEffect, useCallback, useState } from 'react';
import { harmonyBridge } from './harmonyBridge';
import { audioPlayer } from '../lib/audioPlayer';

/**
 * 鸿蒙音频Hook
 * 适配原有的useAudio Hook，在鸿蒙环境下使用原生及自定义音频功能
 */
export function useHarmonyAudio() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsAudioEnabled(audioPlayer.getEnabled());
  }, []);

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
  const playNumber = useCallback(async (number: number, options?: { fast?: boolean }) => {
    if (!isAudioEnabled) {
      console.log('音频未启用，跳过播放');
      return;
    }
    try {
      await audioPlayer.playNumber(number, options);
    } catch (error) {
      console.error(`播放数字语音失败: ${number}`, error);
    }
  }, [isAudioEnabled]);

  /**
   * 播放运算符语音
   */
  const playOperator = useCallback(async (operator: string) => {
    if (!isAudioEnabled) {
      console.log('音频未启用，跳过播放');
      return;
    }
    try {
      await audioPlayer.playOperator(operator);
    } catch (error) {
      console.error(`播放运算符语音失败: ${operator}`, error);
    }
  }, [isAudioEnabled]);

  /**
   * 播放删除音效
   */
  const playDelete = useCallback(async () => {
    if (!isAudioEnabled) {
      console.log('音频未启用，跳过播放');
      return;
    }
    try {
      await audioPlayer.playDelete();
    } catch (error) {
      console.error('播放删除音效失败', error);
    }
  }, [isAudioEnabled]);

  /**
   * 播放按钮点击音效
   */
  const playButtonClick = useCallback(async () => {
    if (!isAudioEnabled) return;
    try {
      await audioPlayer.playDelete();
    } catch (error) {
      console.error('播放按钮点击音效失败', error);
    }
  }, [isAudioEnabled]);

  /**
   * 语音播报文本
   */
  const speakText = useCallback(async (text: string, rate: number = 1.0) => {
    if (!isAudioEnabled) {
      console.log('音频未启用，跳过播报:', text);
      return;
    }
    try {
      await audioPlayer.speakText(text, rate);
    } catch (error) {
      console.error(`speakText 失败: ${text}`, error);
    }
  }, [isAudioEnabled]);

  /**
   * 播放时间语音
   */
  const playTime = useCallback(async (hour: number, minute: number, options?: { fast?: boolean }) => {
    if (!isAudioEnabled) {
      console.log('音频未启用，跳过时间播放');
      return;
    }
    try {
      const isDefaultProfile = audioPlayer.getCurrentVoiceProfile() === 'default';
      if (isDefaultProfile) {
        // 系统默认语音，直接使用TTS合成整句话，发音非常连贯且准确
        let timeText = `${hour}点`;
        if (minute === 0) {
          timeText += '整';
        } else if (minute < 10) {
          timeText += `零${minute}分`;
        } else {
          timeText += `${minute}分`;
        }
        console.log(`[useHarmonyAudio] 系统语音整句播报时间: ${timeText}`);
        await speakText(timeText);
      } else {
        // 自定义录音方案，需要逐字播放已录制的音频片段
        console.log(`[useHarmonyAudio] 自定义语音分段播放时间: ${hour}:${minute}`);
        await audioPlayer.playTime(hour, minute, options);
      }
    } catch (error) {
      console.error(`播放时间语音失败: ${hour}:${minute}`, error);
    }
  }, [isAudioEnabled, speakText]);

  /**
   * 播放正确答案音效
   */
  const playCorrect = useCallback(async () => {
    if (!isAudioEnabled) return;
    try {
      await speakText('太棒了！');
    } catch (error) {
      console.error('播放正确音效失败', error);
    }
  }, [isAudioEnabled, speakText]);

  /**
   * 播放错误答案音效
   */
  const playWrong = useCallback(async () => {
    if (!isAudioEnabled) return;
    try {
      await speakText('再试一次哦！');
    } catch (error) {
      console.error('播放错误音效失败', error);
    }
  }, [isAudioEnabled, speakText]);

  /**
   * 切换音频启用状态
   */
  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    audioPlayer.setEnabled(newState);
    console.log('音频状态切换:', newState);
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
    speakText,
    playTime,
    playCorrect,
    playWrong,
    toggleAudio,
    setVolume
  };
}
