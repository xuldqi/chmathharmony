import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import VoiceRecognition from '@/plugins/voiceRecognition';
import { harmonyBridge } from '@/adapters/harmonyBridge';

type StartOptions = {
  language?: string;
  prompt?: string;
  partialResults?: boolean;
};

interface WebRecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface WebRecognitionErrorEvent {
  error?: string;
}

interface WebRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: WebRecognitionResultEvent) => void) | null;
  onerror: ((event: WebRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type WebRecognitionCtor = new () => WebRecognition;

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: WebRecognitionCtor;
  SpeechRecognition?: WebRecognitionCtor;
};

function pickNormalizedVoiceText(text?: string, processed?: string): string {
  const transcript = (text || '').trim();
  if (transcript) return transcript;

  const normalized = (processed || '').trim();
  if (normalized) return normalized;
  return '';
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string>('');
  const [partialResult, setPartialResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const webRecognitionRef = useRef<WebRecognition | null>(null);
  const partialListenerRef = useRef<{ remove: () => Promise<void> } | null>(null);
  const latestPartialRef = useRef<string>('');

  useEffect(() => {
    const isHarmony = harmonyBridge.isHarmonyOS() || (typeof window !== 'undefined' && !!window.HarmonyBridge);
    if (!isHarmony) {
      return;
    }

    const handleVoiceResult = (data: any) => {
      console.log('[HarmonyOS Bridge] 收到语音识别结果:', data);
      const text = data?.result || '';
      setResult(text);
      setPartialResult('');
      setError(null);
      setIsListening(false);
    };

    const handleVoiceError = (data: any) => {
      console.error('[HarmonyOS Bridge] 收到语音识别错误:', data);
      const errMsg = typeof data?.error === 'object' ? data?.error?.message : data?.error;
      const errorString = errMsg || '语音识别失败';
      setError(`${errorString}#${Date.now()}`);
      setIsListening(false);
    };

    const handleVoiceEvent = (data: any) => {
      console.log('[HarmonyOS Bridge] 收到语音识别事件:', data);
      const eventType = data?.eventType || '';
      if (eventType.includes('听取') || eventType.includes('录音') || eventType.includes('Started')) {
        setIsListening(true);
        setError(null);
      } else if (eventType.includes('完成') || eventType.includes('错误') || eventType.includes('Stopped')) {
        setIsListening(false);
      }
    };

    const handlePermissionResult = (data: any) => {
      console.log('[HarmonyOS Bridge] 收到麦克风权限状态:', data);
      setPermissionGranted(data?.hasPermission ?? null);
    };

    harmonyBridge.addEventListener('voiceResult', handleVoiceResult);
    harmonyBridge.addEventListener('voiceError', handleVoiceError);
    harmonyBridge.addEventListener('voiceEvent', handleVoiceEvent);
    harmonyBridge.addEventListener('voicePermission', handlePermissionResult);

    // Initial check of permission on ready
    harmonyBridge.waitForReady().then(() => {
      const bridge = harmonyBridge.getBridge();
      if (bridge) {
        bridge.device.requestPermission('microphone').then((granted) => {
          setPermissionGranted(granted);
        }).catch(() => {
          setPermissionGranted(false);
        });
      }
    });

    return () => {
      harmonyBridge.removeEventListener('voiceResult', handleVoiceResult);
      harmonyBridge.removeEventListener('voiceError', handleVoiceError);
      harmonyBridge.removeEventListener('voiceEvent', handleVoiceEvent);
      harmonyBridge.removeEventListener('voicePermission', handlePermissionResult);
    };
  }, []);

  const clearResult = useCallback(() => {
    setResult('');
    setPartialResult('');
    setError(null);
    latestPartialRef.current = '';
  }, []);

  const refreshPermission = useCallback(async () => {
    const isHarmony = harmonyBridge.isHarmonyOS() || (typeof window !== 'undefined' && !!window.HarmonyBridge);
    if (isHarmony) {
      try {
        await harmonyBridge.waitForReady();
        const bridge = harmonyBridge.getBridge();
        if (bridge) {
          const granted = await bridge.device.requestPermission('microphone');
          setPermissionGranted(granted);
          return granted;
        }
      } catch {
        setPermissionGranted(false);
        return false;
      }
    }

    if (!Capacitor.isNativePlatform()) {
      setPermissionGranted(null);
      return null;
    }
    try {
      const permission = await VoiceRecognition.checkPermission();
      const granted = !!permission?.granted;
      setPermissionGranted(granted);
      return granted;
    } catch {
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const startWebRecognition = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('浏览器不支持语音识别');
      return false;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;
    if (!SpeechRecognition) {
      setError('浏览器不支持语音识别');
      return false;
    }
    const recognition = new SpeechRecognition();
    webRecognitionRef.current = recognition;

    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: WebRecognitionResultEvent) => {
      const transcript = event.results[0][0].transcript;
      setResult(transcript);
      setError(null);
    };

    recognition.onerror = (event: WebRecognitionErrorEvent) => {
      const code = event?.error as string | undefined;
      let message = '语音识别暂时不可用，可改用键盘输入';

      switch (code) {
        case 'no-speech':
          message = '没听清，这次没有收到声音，可改用键盘输入';
          break;
        case 'audio-capture':
          message = '无法访问麦克风，请检查设备或权限，可改用键盘输入';
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          message = '麦克风权限被拒绝，请在系统设置里开启';
          break;
        case 'network':
          // 浏览器自己的语音服务网络异常，这里不再直接提英文错误码
          message = '浏览器语音服务暂时不可用，可改用键盘输入';
          break;
        case 'aborted':
          message = '语音识别已取消';
          break;
        case 'language-not-supported':
          message = '当前语言暂不支持语音识别';
          break;
        default:
          // 兜底用一条通用中文，不再透出英文 error code
          message = '语音识别暂时不可用，可改用键盘输入';
      }

      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    return true;
  }, []);

  const stopWebRecognition = useCallback(() => {
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      webRecognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(
    async (options?: StartOptions) => {
      clearResult();

      const isHarmony = harmonyBridge.isHarmonyOS() || (typeof window !== 'undefined' && !!window.HarmonyBridge);
      if (isHarmony) {
        try {
          await harmonyBridge.waitForReady();
          const bridge = harmonyBridge.getBridge();
          if (bridge) {
            setIsListening(true);
            setPartialResult('');
            bridge.voice.startRecognition();
            return true;
          }
        } catch (err) {
          console.error('[HarmonyOS Voice] startRecognition failed:', err);
          setError('启动语音识别失败');
          setIsListening(false);
          return false;
        }
      }

      if (Capacitor.isNativePlatform()) {
        try {
          const permission = await VoiceRecognition.checkPermission();
          const granted = !!permission?.granted;
          setPermissionGranted(granted);
          if (!granted) {
            const requested = await VoiceRecognition.requestPermission();
            const grantedAfter = !!requested?.granted;
            setPermissionGranted(grantedAfter);
            if (!grantedAfter) {
              setError('麦克风权限被拒绝');
              setIsListening(false);
              return false;
            }
          }

          setIsListening(true);
          setPartialResult('');

          const usePartial = options?.partialResults ?? true;
          if (usePartial) {
            partialListenerRef.current = await VoiceRecognition.addListener(
              'partialResult',
              (event: { transcript?: string; processed?: string }) => {
                const text = pickNormalizedVoiceText(event?.transcript, event?.processed);
                if (text) {
                  latestPartialRef.current = text;
                  setPartialResult(text);
                }
              }
            );
          }

          // 安全超时：如果原生 start() 在 8 秒内未 resolve，强制超时
          // 防止 Capacitor PluginCall 生命周期异常导致 UI 永远卡在 "正在听取..."
          const startPromise = VoiceRecognition.start({
            language: options?.language || 'zh-CN',
            partialResults: usePartial,
            prompt: options?.prompt || '请说出数学运算'
          });
          const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) => {
            setTimeout(() => resolve({ success: false, error: '识别超时' }), 8000);
          });
          const res = await Promise.race([startPromise, timeoutPromise]);

          if (partialListenerRef.current) {
            try {
              await partialListenerRef.current.remove();
            } catch { /* already removed by stop */ }
            partialListenerRef.current = null;
          }

          if (res?.success) {
            const finalText = pickNormalizedVoiceText(res.text, res.processed);
            const partialText = latestPartialRef.current.trim();

            // Vosk 在松手收尾时偶发截断 final（例如“零三十加一”只回“零三十”），
            // 若最近 partial 更长，优先用 partial 兜底。
            const chosenText =
              partialText && partialText.length > finalText.length
                ? partialText
                : finalText;

            setResult(chosenText);
            setPartialResult('');
            latestPartialRef.current = '';
            setError(null);
            setIsListening(false);
            return true;
          }

          setError(res?.error || '语音识别失败');
          setPartialResult('');
          latestPartialRef.current = '';
          setIsListening(false);
          return false;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err || '');

          // 如果原生插件在当前设备上不可用，自动降级到 Web/系统语音识别，
          // 避免一直提示 "plugin is not implemented" 而完全不能用语音。
          if (
            msg.includes('plugin is not implemented') ||
            msg.includes('not implemented on android')
          ) {
            console.warn('[VoiceRecognition] Native plugin not available, falling back to web recognition:', msg);
            setIsListening(false);
            return startWebRecognition();
          }

          setError(msg || '语音识别启动失败');
          setIsListening(false);
          return false;
        }
      }

      return startWebRecognition();
    },
    [clearResult, startWebRecognition]
  );

  const stopRecognition = useCallback(async () => {
    const isHarmony = harmonyBridge.isHarmonyOS() || (typeof window !== 'undefined' && !!window.HarmonyBridge);
    if (isHarmony) {
      try {
        await harmonyBridge.waitForReady();
        const bridge = harmonyBridge.getBridge();
        if (bridge) {
          bridge.voice.stopRecognition();
        }
      } catch (err) {
        console.error('[HarmonyOS Voice] stopRecognition failed:', err);
      }
      setIsListening(false);
      return;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await VoiceRecognition.stop();
      } catch {
        // ignore
      }
      if (partialListenerRef.current) {
        try {
          await partialListenerRef.current.remove();
        } catch {
          // ignore
        }
        partialListenerRef.current = null;
      }
      setIsListening(false);
      return;
    }
    stopWebRecognition();
  }, [stopWebRecognition]);

  useEffect(() => {
    return () => {
      stopWebRecognition();
    };
  }, [stopWebRecognition]);

  return {
    isListening,
    result,
    partialResult,
    error,
    permissionGranted,
    startRecognition,
    stopRecognition,
    clearResult,
    refreshPermission
  };
}
