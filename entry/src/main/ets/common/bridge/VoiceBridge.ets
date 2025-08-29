import VoiceManager from '../managers/VoiceManager';

/**
 * 语音识别桥接类
 * 处理Web端语音识别请求
 */
export default class VoiceBridge {
  private voiceManager: VoiceManager = new VoiceManager();
  private sendToWeb: ((data: any) => void) | null = null;

  /**
   * 初始化语音桥接
   * @param sendCallback 向Web发送消息的回调函数
   */
  init(sendCallback: (data: any) => void): void {
    this.sendToWeb = sendCallback;
    
    // 设置语音识别结果回调
    this.voiceManager.init((result) => {
      this.sendVoiceResult(result);
    }, (error) => {
      this.sendVoiceError(error);
    });
    
    console.info('VoiceBridge初始化完成');
  }

  /**
   * 处理来自Web的语音消息
   * @param action 操作类型
   * @param data 数据
   */
  async handleMessage(action: string, data: any): Promise<void> {
    try {
      switch (action) {
        case 'voice_startRecognition':
          await this.startRecognition();
          break;
        case 'voice_stopRecognition':
          await this.stopRecognition();
          break;
        case 'voice_checkPermission':
          await this.checkPermission();
          break;
        default:
          console.warn(`未知的语音操作: ${action}`);
      }
    } catch (error) {
      console.error(`语音操作失败: ${action}`, JSON.stringify(error));
      this.sendVoiceError(error);
    }
  }

  /**
   * 开始语音识别
   */
  private async startRecognition(): Promise<void> {
    console.info('开始语音识别');
    
    try {
      await this.voiceManager.startRecognition();
      this.sendVoiceEvent('recognitionStarted');
    } catch (error) {
      console.error('开始语音识别失败', JSON.stringify(error));
      throw error;
    }
  }

  /**
   * 停止语音识别
   */
  private async stopRecognition(): Promise<void> {
    console.info('停止语音识别');
    
    try {
      await this.voiceManager.stopRecognition();
      this.sendVoiceEvent('recognitionStopped');
    } catch (error) {
      console.error('停止语音识别失败', JSON.stringify(error));
      throw error;
    }
  }

  /**
   * 检查语音权限
   */
  private async checkPermission(): Promise<void> {
    console.info('检查语音权限');
    
    try {
      const hasPermission = await this.voiceManager.checkPermission();
      this.sendToWeb?.({
        event: 'voicePermission',
        hasPermission: hasPermission
      });
    } catch (error) {
      console.error('检查语音权限失败', JSON.stringify(error));
      throw error;
    }
  }

  /**
   * 发送语音识别结果到Web
   * @param result 识别结果
   */
  private sendVoiceResult(result: string): void {
    console.info(`语音识别结果: ${result}`);
    this.sendToWeb?.({
      event: 'voiceResult',
      result: result,
      timestamp: Date.now()
    });
  }

  /**
   * 发送语音识别错误到Web
   * @param error 错误信息
   */
  private sendVoiceError(error: any): void {
    console.error('语音识别错误:', JSON.stringify(error));
    this.sendToWeb?.({
      event: 'voiceError',
      error: error,
      timestamp: Date.now()
    });
  }

  /**
   * 发送语音事件到Web
   * @param eventType 事件类型
   */
  private sendVoiceEvent(eventType: string): void {
    this.sendToWeb?.({
      event: 'voiceEvent',
      eventType: eventType,
      timestamp: Date.now()
    });
  }

  /**
   * 销毁语音桥接
   */
  destroy(): void {
    this.voiceManager.destroy();
    this.sendToWeb = null;
    console.info('VoiceBridge已销毁');
  }
}


