import { useEffect, useCallback, useState } from 'react';
import { harmonyBridge } from './harmonyBridge';

/**
 * 鸿蒙语音识别Hook
 * 适配原有的语音识别功能，在鸿蒙环境下使用原生语音识别服务
 */
export function useHarmonyVoice() {
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeVoice = async () => {
      try {
        await harmonyBridge.waitForReady();
        if (mounted) {
          setIsReady(true);
          console.log('鸿蒙语音识别系统已就绪');
          
          // 检查权限
          checkVoicePermission();
        }
      } catch (error) {
        console.error('鸿蒙语音识别系统初始化失败:', error);
        setError('语音识别系统初始化失败');
      }
    };

    initializeVoice();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // 监听语音识别结果
    const handleVoiceResult = (data: any) => {
      console.log('收到语音识别结果:', data);
      setResult(data.result || '');
      setError(null);
    };

    // 监听语音识别错误
    const handleVoiceError = (data: any) => {
      console.error('语音识别错误:', data);
      setError(data.error?.message || '语音识别失败');
      setIsListening(false);
    };

    // 监听语音识别事件
    const handleVoiceEvent = (data: any) => {
      console.log('语音识别事件:', data);
      switch (data.eventType) {
        case 'recognitionStarted':
          setIsListening(true);
          setError(null);
          break;
        case 'recognitionStopped':
          setIsListening(false);
          break;
      }
    };

    // 监听权限结果
    const handlePermissionResult = (data: any) => {
      console.log('权限检查结果:', data);
      setHasPermission(data.hasPermission);
    };

    harmonyBridge.addEventListener('voiceResult', handleVoiceResult);
    harmonyBridge.addEventListener('voiceError', handleVoiceError);
    harmonyBridge.addEventListener('voiceEvent', handleVoiceEvent);
    harmonyBridge.addEventListener('voicePermission', handlePermissionResult);

    return () => {
      harmonyBridge.removeEventListener('voiceResult', handleVoiceResult);
      harmonyBridge.removeEventListener('voiceError', handleVoiceError);
      harmonyBridge.removeEventListener('voiceEvent', handleVoiceEvent);
      harmonyBridge.removeEventListener('voicePermission', handlePermissionResult);
    };
  }, []);

  /**
   * 检查语音权限
   */
  const checkVoicePermission = useCallback(async () => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge && isReady) {
        const granted = await bridge.device.requestPermission('microphone');
        setHasPermission(granted);
        return granted;
      } else {
        // Web环境下检查麦克风权限
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
          return true;
        } catch (error) {
          console.warn('Web麦克风权限检查失败:', error);
          setHasPermission(false);
          return false;
        }
      }
    } catch (error) {
      console.error('权限检查失败:', error);
      setHasPermission(false);
      return false;
    }
  }, [isReady]);

  /**
   * 开始语音识别
   */
  const startRecognition = useCallback(async () => {
    if (!isReady) {
      setError('语音识别系统未就绪');
      return false;
    }

    if (hasPermission === false) {
      setError('麦克风权限被拒绝');
      return false;
    }

    if (hasPermission === null) {
      const granted = await checkVoicePermission();
      if (!granted) {
        setError('麦克风权限被拒绝');
        return false;
      }
    }

    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        console.log('开始鸿蒙语音识别');
        bridge.voice.startRecognition();
        setResult('');
        setError(null);
        return true;
      } else {
        console.warn('鸿蒙桥接不可用，尝试使用Web语音识别');
        return await startWebRecognition();
      }
    } catch (error) {
      console.error('开始语音识别失败:', error);
      setError('开始语音识别失败');
      return false;
    }
  }, [isReady, hasPermission, checkVoicePermission]);

  /**
   * 停止语音识别
   */
  const stopRecognition = useCallback(async () => {
    try {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        console.log('停止鸿蒙语音识别');
        bridge.voice.stopRecognition();
      } else {
        console.warn('鸿蒙桥接不可用，停止Web语音识别');
        stopWebRecognition();
      }
    } catch (error) {
      console.error('停止语音识别失败:', error);
      setError('停止语音识别失败');
    }
  }, []);

  /**
   * 清除结果和错误
   */
  const clearResult = useCallback(() => {
    setResult('');
    setError(null);
  }, []);

  return {
    isReady,
    isListening,
    result,
    error,
    hasPermission,
    startRecognition,
    stopRecognition,
    checkVoicePermission,
    clearResult
  };
}

// Web语音识别相关变量
let webRecognition: any = null;
let webRecognitionCallback: ((result: string) => void) | null = null;

/**
 * Web语音识别回退方案
 */
async function startWebRecognition(): Promise<boolean> {
  try {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('浏览器不支持语音识别');
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    webRecognition = new SpeechRecognition();
    
    webRecognition.lang = 'zh-CN';
    webRecognition.continuous = false;
    webRecognition.interimResults = false;
    
    webRecognition.onstart = () => {
      console.log('Web语音识别开始');
    };
    
    webRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Web语音识别结果:', transcript);
      if (webRecognitionCallback) {
        webRecognitionCallback(transcript);
      }
    };
    
    webRecognition.onerror = (event: any) => {
      console.error('Web语音识别错误:', event.error);
    };
    
    webRecognition.start();
    return true;
  } catch (error) {
    console.error('Web语音识别启动失败:', error);
    return false;
  }
}

/**
 * 停止Web语音识别
 */
function stopWebRecognition(): void {
  if (webRecognition) {
    try {
      webRecognition.stop();
      webRecognition = null;
    } catch (error) {
      console.warn('停止Web语音识别失败:', error);
    }
  }
}



