import { promptAction } from '@kit.ArkUI';
import { speechRecognizer } from '@kit.CoreSpeechKit';
import { BusinessError } from '@kit.BasicServicesKit';

// 语音识别管理器
class VoiceRecognitionManager {
  private static instance: VoiceRecognitionManager;
  private isListening: boolean = false;
  private asrEngine: speechRecognizer.SpeechRecognitionEngine | null = null;
  private sessionId: string = '';

  static getInstance(): VoiceRecognitionManager {
    if (!VoiceRecognitionManager.instance) {
      VoiceRecognitionManager.instance = new VoiceRecognitionManager();
    }
    return VoiceRecognitionManager.instance;
  }

  async checkPermission(): Promise<boolean> {
    return true;
  }

  async requestPermission(): Promise<boolean> {
    return true;
  }

  isSupported(): boolean {
    return true;
  }

  async startRecognition(onResult: (text: string) => void): Promise<boolean> {
    if (this.isListening) {
      return false;
    }

    try {
      // 创建语音识别引擎
      const extraParam: Record<string, Object> = {
        "locate": "CN",
        "recognizerMode": "short"
      };
      const initParamsInfo: speechRecognizer.CreateEngineParams = {
        language: 'zh-CN',
        online: 1,
        extraParams: extraParam
      };

      // 使用 createEngine 创建引擎
      this.asrEngine = await new Promise<speechRecognizer.SpeechRecognitionEngine>((resolve, reject) => {
        speechRecognizer.createEngine(initParamsInfo, (err: BusinessError, engine: speechRecognizer.SpeechRecognitionEngine) => {
          if (err) {
            reject(err);
          } else {
            resolve(engine);
          }
        });
      });

      this.sessionId = Date.now().toString();
      this.isListening = true;

      // 设置识别回调
      const listener: speechRecognizer.RecognitionListener = {
        onStart: (sessionId: string, eventMessage: string) => {
          console.info(`[Voice] 开始识别: ${sessionId}`);
        },
        onEvent: (sessionId: string, eventCode: number, eventMessage: string) => {
          console.info(`[Voice] 事件: ${eventCode} - ${eventMessage}`);
        },
        onResult: (sessionId: string, result: speechRecognizer.SpeechRecognitionResult) => {
          // 使用 result 属性获取识别文本
          const text = result.result || '';
          if (text) {
            onResult(text);
          }
        },
        onComplete: (sessionId: string, eventMessage: string) => {
          console.info(`[Voice] 识别完成: ${eventMessage}`);
          this.isListening = false;
        },
        onError: (sessionId: string, errorCode: number, errorMessage: string) => {
          console.error(`[Voice] 错误: ${errorCode} - ${errorMessage}`);
          this.isListening = false;
        }
      };

      this.asrEngine.setListener(listener);

      // 开始识别
      const audioParam: speechRecognizer.AudioInfo = {
        audioType: 'pcm',
        sampleRate: 16000,
        soundChannel: 1,
        sampleBit: 16
      };
      const recognizerParams: speechRecognizer.StartParams = {
        sessionId: this.sessionId,
        audioInfo: audioParam,
        extraParams: {
          // 0: 实时录音识别，会自动打开麦克风
          "recognitionMode": 0,
          "maxAudioDuration": 60000
        }
      };

      this.asrEngine.startListening(recognizerParams);
      promptAction.showToast({ message: '正在听取...' });
      return true;
    } catch (error) {
      console.error('[Voice] 识别失败:', error);
      this.isListening = false;
      promptAction.showToast({ message: '语音识别暂时不可用' });
      return false;
    }
  }

  async stopRecognition(): Promise<void> {
    if (this.asrEngine && this.isListening) {
      try {
        this.asrEngine.finish(this.sessionId);
      } catch (e) {
        console.error('[Voice] 停止识别失败:', e);
      }
      this.isListening = false;
    }
  }

  async releaseEngine(): Promise<void> {
    if (this.asrEngine) {
      try {
        this.asrEngine.shutdown();
      } catch (e) {
        console.error('[Voice] 释放引擎失败:', e);
      }
      this.asrEngine = null;
    }
  }

  getListeningState(): boolean {
    return this.isListening;
  }
}

export const VoiceRecognition = VoiceRecognitionManager.getInstance();