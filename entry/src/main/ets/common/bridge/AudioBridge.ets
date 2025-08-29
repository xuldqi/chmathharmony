import AudioManager from '../managers/AudioManager';

/**
 * 音频消息数据接口
 */
interface AudioMessageData {
  number?: number;
  operator?: string;
  volume?: number;
}

/**
 * 音频成功回调数据接口
 */
interface AudioSuccessData {
  event: 'audioSuccess';
  action: string;
  data: AudioMessageData;
}

/**
 * 音频错误回调数据接口
 */
interface AudioErrorData {
  event: 'audioError';
  action: string;
  error: Error;
}

/**
 * 音频桥接类
 * 处理Web端音频播放请求
 */
export default class AudioBridge {
  private audioManager: AudioManager = new AudioManager();
  private sendToWeb: ((data: AudioSuccessData | AudioErrorData) => void) | null = null;

  /**
   * 初始化音频桥接
   * @param sendCallback 向Web发送消息的回调函数
   */
  init(sendCallback: (data: AudioSuccessData | AudioErrorData) => void): void {
    this.sendToWeb = sendCallback;
    this.audioManager.init();
    console.info('AudioBridge初始化完成');
  }

  /**
   * 处理来自Web的音频消息
   * @param action 操作类型
   * @param data 数据
   */
  async handleMessage(action: string, data: AudioMessageData): Promise<void> {
    try {
      switch (action) {
        case 'audio_playNumber':
          if (data.number !== undefined) {
            await this.playNumber(data.number);
          }
          break;
        case 'audio_playOperator':
          if (data.operator !== undefined) {
            await this.playOperator(data.operator);
          }
          break;
        case 'audio_playDelete':
          await this.playDelete();
          break;
        case 'audio_setVolume':
          if (data.volume !== undefined) {
            await this.setVolume(data.volume);
          }
          break;
        case 'audio_preloadAudios':
          await this.preloadAudios();
          break;
        default:
          console.warn(`未知的音频操作: ${action}`);
      }
    } catch (error) {
      console.error(`音频操作失败: ${action}`, JSON.stringify(error));
      this.sendError(action, new Error('音频操作失败'));
    }
  }

  /**
   * 播放数字语音
   * @param number 数字
   */
  private async playNumber(number: number): Promise<void> {
    console.info(`播放数字语音: ${number}`);
    
    try {
      await this.audioManager.playNumber(number);
      const successData: AudioMessageData = { number };
      this.sendSuccess('audio_playNumber', successData);
    } catch (error) {
      console.error(`播放数字语音失败: ${number}`, JSON.stringify(error));
      throw new Error('播放数字语音失败');
    }
  }

  /**
   * 播放运算符语音
   * @param operator 运算符
   */
  private async playOperator(operator: string): Promise<void> {
    console.info(`播放运算符语音: ${operator}`);
    
    try {
      await this.audioManager.playOperator(operator);
      const successData: AudioMessageData = { operator };
      this.sendSuccess('audio_playOperator', successData);
    } catch (error) {
      console.error(`播放运算符语音失败: ${operator}`, JSON.stringify(error));
      throw new Error('播放运算符语音失败');
    }
  }

  /**
   * 播放删除音效
   */
  private async playDelete(): Promise<void> {
    console.info('播放删除音效');
    
    try {
      await this.audioManager.playDelete();
      const successData: AudioMessageData = {};
      this.sendSuccess('audio_playDelete', successData);
    } catch (error) {
      console.error('播放删除音效失败', JSON.stringify(error));
      throw new Error('播放删除音效失败');
    }
  }

  /**
   * 设置音量
   * @param volume 音量值 (0-1)
   */
  private async setVolume(volume: number): Promise<void> {
    console.info(`设置音量: ${volume}`);
    
    try {
      await this.audioManager.setVolume(volume);
      const successData: AudioMessageData = { volume };
      this.sendSuccess('audio_setVolume', successData);
    } catch (error) {
      console.error(`设置音量失败: ${volume}`, JSON.stringify(error));
      throw new Error('设置音量失败');
    }
  }

  /**
   * 预加载音频文件
   */
  private async preloadAudios(): Promise<void> {
    console.info('预加载音频文件');
    
    try {
      await this.audioManager.preloadCommonAudios();
      const successData: AudioMessageData = {};
      this.sendSuccess('audio_preloadAudios', successData);
    } catch (error) {
      console.error('预加载音频文件失败', JSON.stringify(error));
      throw new Error('预加载音频文件失败');
    }
  }

  /**
   * 发送成功消息到Web
   * @param action 操作类型
   * @param data 数据
   */
  private sendSuccess(action: string, data: AudioMessageData): void {
    if (this.sendToWeb) {
      const successCallback: AudioSuccessData = {
        event: 'audioSuccess',
        action: action,
        data: data
      };
      this.sendToWeb(successCallback);
    }
  }

  /**
   * 发送错误消息到Web
   * @param action 操作类型
   * @param error 错误信息
   */
  private sendError(action: string, error: Error): void {
    if (this.sendToWeb) {
      const errorCallback: AudioErrorData = {
        event: 'audioError',
        action: action,
        error: error
      };
      this.sendToWeb(errorCallback);
    }
  }

  /**
   * 销毁音频桥接
   */
  destroy(): void {
    this.audioManager.destroy();
    this.sendToWeb = null;
    console.info('AudioBridge已销毁');
  }
}
