import { audio } from '@kit.AudioKit';
import { common } from '@kit.AbilityKit';
import { promptAction } from '@kit.ArkUI';

class AudioPlayerManager {
  private static instance: AudioPlayerManager;
  private audioRenderer: audio.AudioRenderer | null = null;
  private context: common.UIAbilityContext | null = null;

  static getInstance(): AudioPlayerManager {
    if (!AudioPlayerManager.instance) {
      AudioPlayerManager.instance = new AudioPlayerManager();
    }
    return AudioPlayerManager.instance;
  }

  init(context: common.UIAbilityContext): void {
    this.context = context;
  }

  async playNumber(num: number): Promise<void> {
    console.log(`[Audio] 播放数字: ${num}`);
    // 实际播放需要音频文件，这里用 Toast 提示
    promptAction.showToast({ message: `播放数字: ${num}` });
  }

  async playOperator(op: string): Promise<void> {
    console.log(`[Audio] 播放运算符: ${op}`);
    promptAction.showToast({ message: `播放运算符: ${op}` });
  }

  async playResult(value: string): Promise<void> {
    console.log(`[Audio] 播放结果: ${value}`);
    promptAction.showToast({ message: `播放结果: ${value}` });
  }

  async playCorrect(): Promise<void> {
    console.log(`[Audio] 播放正确音效`);
  }

  async playWrong(): Promise<void> {
    console.log(`[Audio] 播放错误音效`);
  }

  stopAll(): void {
    console.log(`[Audio] 停止所有音频`);
  }
}

export const AudioPlayer = AudioPlayerManager.getInstance();
