import { useCallback, useEffect, useState } from 'react';
import { audioPlayer } from '../lib/audioPlayer';

interface VoiceProfile {
  id: string;
  name: string;
  type: 'default' | 'custom';
  recordings?: { [key: string]: string };
}

/**
 * 语音播放Hook
 * 提供语音播放功能和音频设置管理
 */
export const useAudio = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVoiceProfile, setCurrentVoiceProfile] = useState<string>('default');
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);

  // 初始化音频播放器
  useEffect(() => {
    audioPlayer.preloadCommonAudios();
    setCurrentVoiceProfile(audioPlayer.getCurrentVoiceProfile());
    setVoiceProfiles(audioPlayer.getVoiceProfiles());
  }, []);

  // 监听语音方案变化
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentVoiceProfile(audioPlayer.getCurrentVoiceProfile());
      setVoiceProfiles(audioPlayer.getVoiceProfiles());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 播放数字语音
  const playNumber = useCallback(async (num: number, options?: { fast?: boolean }) => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.playNumber(num, options);
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放运算符语音
  const playOperator = useCallback(async (operator: string) => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.playOperator(operator);
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放删除音效
  const playDelete = useCallback(async () => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.playDelete();
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放自定义音频
  const playAudio = useCallback(async (audioName: string) => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.playAudio(audioName);
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 语音播报文本
  const speakText = useCallback(async (text: string, rate: number = 1.0) => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.speakText(text, rate);
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放时间语音
  const playTime = useCallback(async (hour: number, minute: number, options?: { fast?: boolean }) => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      await audioPlayer.playTime(hour, minute, options);
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放按钮点击音效
  const playButtonClick = useCallback(async () => {
    if (!isAudioEnabled) return;
    // 通用按钮点击音效，暂时不播放任何声音
    // await playNumber(1);
  }, [isAudioEnabled]);

  // 播放正确答案音效
  const playCorrect = useCallback(async () => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      // 正确答案不播放任何语音，只是静默表示正确
      // 可以在这里添加一个短暂的延迟来模拟音效播放时间
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 播放错误答案音效
  const playWrong = useCallback(async () => {
    if (!isAudioEnabled) return;
    setIsLoading(true);
    try {
      // 错误答案也不播放任何语音，只是静默表示错误
      // 可以在这里添加一个短暂的延迟来模拟音效播放时间
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  }, [isAudioEnabled]);

  // 切换音频开关
  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    audioPlayer.setEnabled(newState);
  }, [isAudioEnabled]);

  // 设置音频开关
  const setAudioEnabled = useCallback((enabled: boolean) => {
    setIsAudioEnabled(enabled);
    audioPlayer.setEnabled(enabled);
  }, []);

  // 设置语音方案
  const setVoiceProfile = useCallback((profileId: string) => {
    audioPlayer.setCurrentVoiceProfile(profileId);
    setCurrentVoiceProfile(profileId);
  }, []);

  // 获取语音方案列表
  const getVoiceProfiles = useCallback(() => {
    return audioPlayer.getVoiceProfiles();
  }, []);

  // 刷新语音方案列表
  const refreshVoiceProfiles = useCallback(() => {
    setVoiceProfiles(audioPlayer.getVoiceProfiles());
    setCurrentVoiceProfile(audioPlayer.getCurrentVoiceProfile());
  }, []);

  return {
    isAudioEnabled,
    isLoading,
    currentVoiceProfile,
    voiceProfiles,
    playNumber,
    playOperator,
    playDelete,
    playAudio,
    speakText,
    playTime,
    playButtonClick,
    playCorrect,
    playWrong,
    toggleAudio,
    setAudioEnabled,
    setVoiceProfile,
    getVoiceProfiles,
    refreshVoiceProfiles
  };
};

/**
 * 简化的语音播放Hook，只提供播放功能
 */
export const useSimpleAudio = () => {
  const playNumber = useCallback(async (num: number) => {
    await audioPlayer.playNumber(num);
  }, []);

  const playOperator = useCallback(async (operator: string) => {
    await audioPlayer.playOperator(operator);
  }, []);

  const playAudio = useCallback(async (audioName: string) => {
    await audioPlayer.playAudio(audioName);
  }, []);

  return {
    playNumber,
    playOperator,
    playAudio
  };
};