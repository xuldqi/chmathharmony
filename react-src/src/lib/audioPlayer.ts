/**
 * 语音播放器工具类
 * 用于播放小鹿口算计算器的语音文件
 * 支持鸿蒙、Android (Capacitor) 和 Web 环境
 */

// 鸿蒙环境检测
function isHarmonyOS(): boolean {
  if (typeof window !== 'undefined') {
    // 1. 明确的鸿蒙桥接
    if ((window as Window & { HarmonyBridge?: unknown }).HarmonyBridge || (window as any).HarmonyBridgeNative) {
      return true;
    }
    // 2. 如果是 Capacitor 原生环境，则绝对不是鸿蒙原生环境
    const cap = (window as Window & { Capacitor?: any }).Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return false;
    }
    // 3. 检查 User-Agent
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('harmony') || ua.includes('huawei')) {
      return true;
    }
  }
  return false;
}

// 动态导入 TextToSpeech（仅在非鸿蒙环境）
let TextToSpeech: {
  speak: (options: { text: string; lang: string; rate: number }) => Promise<void>;
  stop: () => Promise<void>;
} | null = null;

// 仅在非鸿蒙环境加载 Capacitor 插件
if (!isHarmonyOS()) {
  try {
    // 动态导入避免在鸿蒙环境下报错
    import('@capacitor-community/text-to-speech').then(module => {
      TextToSpeech = module.TextToSpeech;
    }).catch(() => {
      console.log('[AudioPlayer] TextToSpeech 不可用，将使用本地音频');
    });
  } catch {
    console.log('[AudioPlayer] 无法加载 TextToSpeech，将使用本地音频');
  }
}

interface VoiceProfile {
  id: string;
  name: string;
  type: 'default' | 'custom';
  recordings?: { [key: string]: string }; // key: audio name, value: blob URL
}

type AppWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
  Capacitor?: {
    isNativePlatform?: () => boolean;
    getPlatform?: () => string;
  };
  HarmonyBridge?: {
    audio?: {
      playNumber: (num: number) => void;
      playOperator: (op: string) => void;
      playDelete: () => void;
      setVolume: (vol: number) => void;
      speakText?: (text: string) => void;
    };
  };
};

type HTMLAudioElementWithInline = HTMLAudioElement & {
  playsInline?: boolean;
};

export class AudioPlayer {
  private static instance: AudioPlayer;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private currentVoiceProfile: string = 'default';
  private voiceProfiles: VoiceProfile[] = [];
  private customAudioCache: Map<string, HTMLAudioElement> = new Map();
  private isAndroid: boolean = false;
  private audioContext: AudioContext | null = null;
  private isAudioInitialized: boolean = false;
  private currentlyPlaying: HTMLAudioElement | null = null;
  private pendingTimeouts: Set<NodeJS.Timeout> = new Set();
  private browserCompatibility: {
    audioSupport: boolean;
    oggSupport: boolean;
    mp3Support: boolean;
    webAudioSupport: boolean;
  } = {
    audioSupport: false,
    oggSupport: false,
    mp3Support: false,
    webAudioSupport: false
  };

  private constructor() {
    this.detectBrowserCompatibility();
    this.detectAndroid();
    this.loadVoiceProfiles();
    this.initializeAudioContext();
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * 检测浏览器兼容性
   */
  private detectBrowserCompatibility(): void {
    const appWindow = window as AppWindow;
    // 检测基本音频支持
    this.browserCompatibility.audioSupport = typeof Audio !== 'undefined';
    
    if (this.browserCompatibility.audioSupport) {
      const audio = new Audio();
      
      // 检测OGG格式支持
      this.browserCompatibility.oggSupport = audio.canPlayType('audio/ogg') !== '';
      
      // 检测MP3格式支持
      this.browserCompatibility.mp3Support = audio.canPlayType('audio/mpeg') !== '';
    }
    
    // 检测Web Audio API支持
    this.browserCompatibility.webAudioSupport = 
      typeof AudioContext !== 'undefined' || typeof appWindow.webkitAudioContext !== 'undefined';
    
    console.log('[Audio] [兼容性检测] 浏览器音频兼容性:', this.browserCompatibility);
    
    // 如果没有任何音频支持，发出警告
    if (!this.browserCompatibility.audioSupport) {
      console.warn('[Audio] [兼容性警告] 当前浏览器不支持HTML5音频播放');
    }
    
    if (!this.browserCompatibility.oggSupport && !this.browserCompatibility.mp3Support) {
      console.warn('[Audio] [兼容性警告] 当前浏览器不支持OGG或MP3格式');
    }
  }

  /**
   * 检测是否为Android环境（排除鸿蒙）
   */
  private detectAndroid(): void {
    const appWindow = window as AppWindow;
    const userAgent = navigator.userAgent;
    
    // 鸿蒙环境单独处理
    if (isHarmonyOS()) {
      console.log('[AudioPlayer] 检测到鸿蒙环境');
      this.isAndroid = false;
      return;
    }
    
    // Capacitor 环境（Android/iOS）
    const isCapacitorNative = appWindow.Capacitor?.isNativePlatform?.() === true;
    
    if (isCapacitorNative) {
      this.isAndroid = appWindow.Capacitor?.getPlatform?.() === 'android' || 
                       /Android/i.test(userAgent);
    } else {
      this.isAndroid = /Android/i.test(userAgent);
    }
    
    console.log('[AudioPlayer] 检测到Android环境:', this.isAndroid);
    console.log('[AudioPlayer] 当前平台:', isHarmonyOS() ? 'harmonyos' : (isCapacitorNative ? appWindow.Capacitor?.getPlatform?.() : 'web'));
  }

  /**
   * 初始化音频上下文
   */
  private initializeAudioContext(): void {
    const appWindow = window as AppWindow;
    // 在移动设备上（Android和iOS）初始化音频上下文
    const isMobile = this.isAndroid || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || appWindow.webkitAudioContext)();
        console.log('音频上下文初始化成功');
      } catch (error) {
        console.warn('音频上下文初始化失败:', error);
      }
    }
  }

  /**
   * 解锁音频播放（移动设备需要用户交互）
   */
  public async unlockAudio(): Promise<void> {
    const isMobile = this.isAndroid || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile && this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        this.isAudioInitialized = true;
        console.log('音频播放已解锁');
      } catch (error) {
        console.warn('音频解锁失败:', error);
      }
    } else if (!isMobile) {
      this.isAudioInitialized = true;
    }
  }

  /**
   * 加载语音配置
   */
  private loadVoiceProfiles(): void {
    const savedProfiles = localStorage.getItem('voiceProfiles');
    if (savedProfiles) {
      this.voiceProfiles = JSON.parse(savedProfiles);
    } else {
      this.voiceProfiles = [{ id: 'default', name: '默认语音', type: 'default' }];
    }
    
    const savedSelectedProfile = localStorage.getItem('selectedVoiceProfile');
    if (savedSelectedProfile) {
      this.currentVoiceProfile = savedSelectedProfile;
    }
  }

  /**
   * 获取当前语音方案
   */
  public getCurrentVoiceProfile(): string {
    return this.currentVoiceProfile;
  }

  /**
   * 设置当前语音方案
   */
  public setCurrentVoiceProfile(profileId: string): void {
    this.currentVoiceProfile = profileId;
    localStorage.setItem('selectedVoiceProfile', profileId);
  }

  /**
   * 获取所有语音方案
   */
  public getVoiceProfiles(): VoiceProfile[] {
    return this.voiceProfiles;
  }

  /**
   * 覆盖写入语音方案列表
   */
  public setVoiceProfiles(profiles: VoiceProfile[]): void {
    const safeProfiles = (profiles && profiles.length > 0)
      ? profiles
      : [{ id: 'default', name: '默认语音', type: 'default' as const }];
    this.voiceProfiles = safeProfiles;
    localStorage.setItem('voiceProfiles', JSON.stringify(safeProfiles));
  }

  /**
   * 获取浏览器兼容性信息
   */
  public getBrowserCompatibility() {
    return { ...this.browserCompatibility };
  }

  /**
   * 检查音频播放兼容性
   */
  private checkAudioCompatibility(): boolean {
    if (!this.browserCompatibility.audioSupport) {
      console.error('[Audio] [兼容性错误] 浏览器不支持HTML5音频播放');
      return false;
    }
    
    if (!this.browserCompatibility.oggSupport && !this.browserCompatibility.mp3Support) {
      console.error('[Audio] [兼容性错误] 浏览器不支持任何音频格式');
      return false;
    }
    
    return true;
  }

  /**
   * 获取最佳音频格式
   */
  private getBestAudioFormat(): string {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // iOS优先使用MP3格式
    if (isIOS) {
      return this.browserCompatibility.mp3Support ? 'mp3' : 'ogg';
    }
    
    // 其他平台按照原逻辑
    if (this.browserCompatibility.oggSupport) {
      return 'ogg';
    } else if (this.browserCompatibility.mp3Support) {
      return 'mp3';
    }
    return 'mp3'; // 默认使用MP3而不是OGG
  }

  /**
   * 根据运行环境构建音频URL
   * Web(HTTP)环境使用绝对路径 /audio/...
   * WebView(resource://)环境使用相对路径 audio/...
   */
  private buildAudioSrc(audioName: string, format: string): string {
    try {
      const isHttpEnv = typeof window !== 'undefined' && typeof window.location !== 'undefined'
        && (window.location.protocol === 'http:' || window.location.protocol === 'https:');
      const base = isHttpEnv ? '/audio' : 'audio';
      return `${base}/${audioName}.${format}`;
    } catch {
      // 兜底：使用相对路径
      return `audio/${audioName}.${format}`;
    }
  }

  /**
   * 预加载音频文件
   */
  public preloadAudio(audioName: string): void {
    if (isHarmonyOS()) {
      return;
    }

    if (this.audioCache.has(audioName)) {
      return;
    }

    // 根据浏览器支持选择最佳格式
    const format = this.getBestAudioFormat();
    const audio = new Audio(this.buildAudioSrc(audioName, format));
    
    // iOS优化：使用metadata预加载而不是auto，减少内存使用
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    audio.preload = isIOS ? 'metadata' : 'auto';
    audio.volume = 0; // 设置音量为0，防止意外播放
    
    // iOS特殊处理：设置audio属性以提高兼容性
    if (isIOS) {
      audio.muted = true;
      (audio as HTMLAudioElementWithInline).playsInline = true;
    }
    
    audio.onerror = () => {
      console.warn(`[Audio] [格式回退] ${format}格式加载失败: ${audioName}，尝试备用格式`);
      // 如果首选格式失败，尝试另一种格式；仅在备用格式可播放时才替换缓存
      const fallbackFormat = format === 'ogg' ? 'mp3' : 'ogg';
      const fallbackAudio = new Audio(this.buildAudioSrc(audioName, fallbackFormat));
      fallbackAudio.preload = 'auto';
      fallbackAudio.volume = 0;
      
      fallbackAudio.oncanplaythrough = () => {
        fallbackAudio.volume = 1;
        this.audioCache.set(audioName, fallbackAudio);
      };
      
      fallbackAudio.onerror = () => {
        console.error(`[Audio] [格式错误] 所有音频格式都加载失败: ${audioName}`);
        // 不替换现有缓存，避免污染
      };
    };
    
    // 预加载完成后恢复正常音量，并放入缓存
    audio.oncanplaythrough = () => {
      audio.volume = 1;
      this.audioCache.set(audioName, audio);
    };
    
    // 只有在成功加载时才缓存，避免缓存错误的音频对象
    // this.audioCache.set(audioName, audio); // 移除这行，改为在oncanplaythrough中缓存
  }

  /**
   * 播放音频
   */
  public async playAudio(audioName: string, playbackRate: number = 1.0): Promise<void> {
    console.log(`[Audio] [DEBUG] playAudio 被调用: ${audioName}, 播放速度: ${playbackRate}`);
    
    if (!this.isEnabled) {
      console.log(`[Audio] [DEBUG] 音频已禁用，跳过播放: ${audioName}`);
      return;
    }

    // 检查浏览器兼容性
    if (!this.checkAudioCompatibility()) {
      console.error(`[Audio] [兼容性错误] 无法播放音频，浏览器不兼容: ${audioName}`);
      throw new Error(`浏览器不支持音频播放: ${audioName}`);
    }

    // 移动设备环境下确保音频已解锁
    const isMobile = this.isAndroid || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && !this.isAudioInitialized) {
      console.log(`[Audio] [DEBUG] 移动设备环境，尝试解锁音频`);
      await this.unlockAudio();
    }

    console.log(`[Audio] [DEBUG] 尝试播放音频: ${audioName}, 当前语音方案: ${this.currentVoiceProfile}`);
    
    try {
      // 如果是自定义语音方案，尝试播放自定义录音
      if (this.currentVoiceProfile !== 'default') {
        console.log(`[Audio] [DEBUG] 尝试播放自定义音频: ${audioName}`);
        const customAudio = await this.playCustomAudio(audioName, playbackRate);
        if (customAudio) {
          console.log(`[Audio] [DEBUG] 自定义音频播放成功: ${audioName}`);
          return; // 成功播放自定义音频
        }
      }
      
      // 尝试TTS（系统语音）- 作为默认
      const ttsSuccess = await this.playTTS(audioName, playbackRate);
      if (ttsSuccess) {
        console.log(`[Audio] [DEBUG] TTS播放成功: ${audioName}`);
        return;
      }
      
      // TTS不可用，回退到本地音频文件
      console.log(`[Audio] [DEBUG] TTS不可用，播放默认音频: ${audioName}`);
      await this.playDefaultAudio(audioName, playbackRate);
      console.log(`[Audio] [DEBUG] 默认音频播放完成: ${audioName}`);
    } catch (error) {
      console.error(`[Audio] [ERROR] 播放音频失败: ${audioName}`, error);
      throw error;
    }
  }

  /**
   * 语音播报任意文本
   * @param text 播报文本
   * @param rate 语速
   */
  public async speakText(text: string, rate: number = 1.0): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    console.log(`[Audio] [speakText] 播报文本: ${text}`);

    if (isHarmonyOS()) {
      const appWindow = window as AppWindow;
      if (appWindow.HarmonyBridge?.audio?.speakText) {
        console.log(`[AudioPlayer] 鸿蒙环境，通过原生 speakText 播放文本: ${text}`);
        appWindow.HarmonyBridge.audio.speakText(text);
        return;
      }
      console.log(`[AudioPlayer] 鸿蒙环境原生 speakText 未找到，降级交由 Web TTS 播放: ${text}`);
    }

    // Capacitor TTS
    if (TextToSpeech) {
      try {
        if (this.currentlyPlaying && !this.currentlyPlaying.paused) {
          this.currentlyPlaying.pause();
          this.currentlyPlaying.currentTime = 0;
          this.currentlyPlaying = null;
        }
        await TextToSpeech.stop();
        await TextToSpeech.speak({
          text: text,
          lang: 'zh-CN',
          rate: rate,
        });
        return;
      } catch (error) {
        console.warn('Capacitor TTS speakText failed, falling back to Web Speech API:', error);
      }
    }

    // Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Web Speech API speakText failed:', error);
      }
    } else {
      console.warn('Speech synthesis not supported in this browser/environment.');
    }
  }

  private async playTTS(audioName: string, playbackRate: number = 1.0): Promise<boolean> {
    // 鸿蒙环境：通过原生 HarmonyBridge.audio 的 TTS 能力播放
    if (isHarmonyOS()) {
      const appWindow = window as AppWindow;
      if (appWindow.HarmonyBridge?.audio) {
        console.log(`[AudioPlayer] 鸿蒙环境，通过原生TTS播放: ${audioName}`);
        
        // 1. 数字 num0-num10 → 原生 playNumber（有预存 .ogg）
        const numMatch = audioName.match(/^num(\d+)$/);
        if (numMatch) {
          appWindow.HarmonyBridge.audio.playNumber(parseInt(numMatch[1], 10));
          return true;
        }
        
        // 2. 运算符符号 → 原生 playOperator（有预存 .ogg）
        //    覆盖所有代码中使用的别名
        const operatorMap: Record<string, string> = {
          // 符号形式
          'jia': '+', 'jian': '-', 'chengyi': '*', 'chuyi': '/', 'dengyu': '=', 'dian': '.',
          // 英文别名（Calculator.tsx / Practice 组件中使用）
          'add': '+', 'subtract': '-', 'multiply': '*', 'divide': '/',
          'addition': '+', 'subtraction': '-', 'multiplication': '*', 'division': '/',
          // 其他
          'equal': '=', 'equals': '=', 'dot': '.', 'percent': '%',
        };
        if (operatorMap[audioName]) {
          appWindow.HarmonyBridge.audio.playOperator(operatorMap[audioName]);
          return true;
        }
        
        // 3. 删除指令
        if (audioName === 'del' || audioName === 'delete') {
          appWindow.HarmonyBridge.audio.playDelete();
          return true;
        }
        
        // 4. 其他：把 audioName 转成中文文本，走原生 speakText（真正的鸿蒙 TTS）
        //    不再用 playOperator，因为 playOperator 只能播放预存 .ogg，无法合成任意文字
        const text = this.audioNameToText(audioName);
        if (text && appWindow.HarmonyBridge.audio.speakText) {
          appWindow.HarmonyBridge.audio.speakText(text);
          return true;
        }
        
        // audioName 没有映射文本，也没有 speakText，返回失败让上层降级
        return false;
      }
      return false;
    }
    
    const text = this.audioNameToText(audioName);
    if (!text) {
      console.log(`TTS不可用: 未找到音频名称映射: ${audioName}`);
      return false;
    }

    // 检查 TextToSpeech 是否可用
    if (!TextToSpeech) {
      console.log(`[AudioPlayer] TextToSpeech 不可用: ${audioName}`);
      return false;
    }

    try {
      // 避免与本地音频并发叠播
      if (this.currentlyPlaying && !this.currentlyPlaying.paused) {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.currentTime = 0;
        this.currentlyPlaying = null;
      }

      // 停止之前的语音
      await TextToSpeech.stop();
      
      // 使用原生TTS
      await TextToSpeech.speak({
        text: text,
        lang: 'zh-CN',
        rate: playbackRate,
      });
      
      console.log(`[Audio] [TTS] 原生TTS播放成功: ${text}`);
      return true;
    } catch (error) {
      console.warn(`TTS播放失败: ${audioName}`, error);
      return false;
    }
  }

  /**
   * 将音频名称转换为中文文本（TTS 用）
   * 尽量覆盖所有可能用到的音频名称，确保 TTS 优先播放
   */
  private audioNameToText(audioName: string): string | null {
    const map: Record<string, string> = {
      // 数字 num0-10
      'num0': '零', 'num1': '一', 'num2': '二', 'num3': '三', 'num4': '四',
      'num5': '五', 'num6': '六', 'num7': '七', 'num8': '八', 'num9': '九', 'num10': '十',
      // 中文运算符
      'jia': '加', 'jian': '减', 'chengyi': '乘', 'chuyi': '除', 'dengyu': '等于', 'yuedengyu': '约等于', 'approx': '约等于', 'dian': '点',
      'baifenhao': '百分号', 'fenhao': '分号',
      // 单位
      'shi': '十', 'bai': '百', 'qian': '千', 'wan': '万', 'yi': '亿', 'fu': '负',
      'shuzibai': '数字百',
      // 功能
      'del': '删除', 'clear': '清空', 'delete': '删除', 'ge': '个',
      // 英文数字
      'zero': '零', 'one': '一', 'two': '二', 'three': '三', 'four': '四',
      'five': '五', 'six': '六', 'seven': '七', 'eight': '八', 'nine': '九',
      // 英文运算符
      'add': '加', 'subtraction': '减', 'multiple': '乘', 'division': '除',
      'equal': '等于', 'equals': '等于', 'dot': '点', 'percent': '百分之', 'minus_sign': '负',
      // 其他
      'e': 'e', 'chunew': '春'
    };
    return map[audioName] ?? null;
  }

  /**
   * 播放自定义音频
   */
  private async playCustomAudio(audioName: string, playbackRate: number = 1.0): Promise<boolean> {
    const profile = this.voiceProfiles.find(p => p.id === this.currentVoiceProfile);
    if (!profile || !profile.recordings || !profile.recordings[audioName]) {
      console.log(`自定义语音方案中未找到音频: ${audioName}`);
      return false;
    }

    try {
      // 避免与 TTS 并发叠播
      await TextToSpeech.stop().catch(() => undefined);

      const cacheKey = `${this.currentVoiceProfile}_${audioName}`;
      let audio = this.customAudioCache.get(cacheKey);
      
      if (!audio) {
        audio = new Audio(profile.recordings[audioName]);
        audio.preload = 'auto';
        this.customAudioCache.set(cacheKey, audio);
      }

      // 抢占停止当前本地音频，确保不会与自定义录音叠播
      if (this.currentlyPlaying && !this.currentlyPlaying.paused) {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.currentTime = 0;
      }

      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
      audio.playbackRate = playbackRate;

      this.currentlyPlaying = audio;
      await audio.play();

      // 关键：等待片段播放结束再返回，避免数字分片并发叠音
      await new Promise<void>((resolve) => {
        const onEnded = () => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          if (this.currentlyPlaying === audio) {
            this.currentlyPlaying = null;
          }
          resolve();
        };
        const onError = () => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          if (this.currentlyPlaying === audio) {
            this.currentlyPlaying = null;
          }
          resolve();
        };

        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        if (audio.ended) {
          onEnded();
        }
      });

      console.log(`自定义音频播放成功: ${audioName}`);
      return true;
    } catch (error) {
      this.currentlyPlaying = null;
      console.warn(`播放自定义音频失败: ${audioName}`, error);
      return false;
    }
  }

  /**
   * 播放默认音频
   */
  private async playDefaultAudio(audioName: string, playbackRate: number = 1.0): Promise<void> {
    try {
      // 避免与 TTS 并发叠播
      await TextToSpeech.stop().catch(() => undefined);

      let audio = this.audioCache.get(audioName);
      // 如果缓存的音频对象存在错误，则清理缓存以便重新创建
      // 注意：NETWORK_NO_SOURCE是正常状态，不应作为清理条件
      if (audio && audio.error) {
        try {
          audio.pause();
        } catch {
          // ignore pause error
        }
        this.audioCache.delete(audioName);
        audio = undefined;
      }
      
      // 特殊处理：对于某些音频文件（如chuyi），每次都创建新实例以避免重用问题
      const problemAudios = ['chuyi'];
      const shouldCreateNewInstance = problemAudios.includes(audioName);
      
      if (!audio || shouldCreateNewInstance) {
        console.log(`音频${shouldCreateNewInstance ? '需要新实例' : '未预加载'}，立即创建: ${audioName}`);
        // 如果没有预加载或需要新实例，立即创建，使用最佳格式
        const format = this.getBestAudioFormat();
        audio = new Audio(this.buildAudioSrc(audioName, format));
        audio.volume = 0; // 初始设置音量为0
        
        // Android环境下的特殊处理
        if (this.isAndroid) {
          audio.preload = 'auto';
          audio.crossOrigin = 'anonymous';
        }
        
        // 非Android也开启预加载，提升首次播放成功率
        if (!this.isAndroid) {
          audio.preload = 'auto';
        }
        
        audio.onerror = (e) => {
          console.warn(`[Audio] [格式回退] ${format}格式加载失败: ${audioName}`, e);
          // 尝试备用格式；仅在可播放时替换缓存与当前引用
          const fallbackFormat = format === 'ogg' ? 'mp3' : 'ogg';
          const fallbackAudio = new Audio(this.buildAudioSrc(audioName, fallbackFormat));
          fallbackAudio.volume = 0;
          
          if (this.isAndroid) {
            fallbackAudio.preload = 'auto';
            fallbackAudio.crossOrigin = 'anonymous';
          }
          
          const replaceWithFallback = () => {
            this.audioCache.set(audioName!, fallbackAudio);
            // 重要：更新当前使用的audio引用
            audio = fallbackAudio;
            console.log(`[Audio] [格式回退成功] ${audioName} 已切换到${fallbackFormat}格式`);
          };
          
          fallbackAudio.oncanplaythrough = () => {
            replaceWithFallback();
          };
          
          fallbackAudio.onloadeddata = () => {
            if (fallbackAudio.readyState >= 2) { // HAVE_CURRENT_DATA
              replaceWithFallback();
            }
          };
          
          fallbackAudio.onerror = () => {
            console.error(`[Audio] [格式错误] 所有音频格式都加载失败: ${audioName}`);
            // 不替换，保持原有状态以便后续重试
          };
        };
        
        // 不立即缓存，等到音频可播放时再缓存
        let audioCached = false;
        
        // 添加成功加载的处理器
        const cacheOnSuccess = () => {
          if (!audioCached && !shouldCreateNewInstance) {
            this.audioCache.set(audioName, audio);
            audioCached = true;
            console.log(`[Audio] [缓存成功] 音频已缓存: ${audioName}`);
          } else if (shouldCreateNewInstance) {
            console.log(`[Audio] [跳过缓存] 问题音频不缓存: ${audioName}`);
          }
        };
        
        audio.oncanplaythrough = cacheOnSuccess;
        audio.onloadeddata = () => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
            cacheOnSuccess();
          }
        };
      } else {
        console.log(`使用缓存音频: ${audioName}`);
      }

      // 检查音频是否可以播放
      if (audio.readyState === 0) {
        // 音频还未加载，等待加载完成
        await new Promise((resolve, reject) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(void 0);
          };
          const onError = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error(`音频加载失败: ${audioName}`));
          };
          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
        });
      }

      // 停止当前正在播放的音频（包括同一个音频对象）
      if (this.currentlyPlaying && !this.currentlyPlaying.paused) {
        console.log(`[Audio] 停止之前播放的音频`);
        this.currentlyPlaying.pause();
        this.currentlyPlaying.currentTime = 0;
      }

      // 播放前确保音量正常
      audio.volume = 1;

      // 重置播放位置 - 确保每次都能从头开始播放
      audio.currentTime = 0;
      
      // 如果是同一个音频对象，强制重置播放状态
      if (audio.paused === false) {
        audio.pause();
        audio.currentTime = 0;
        // 添加短暂延迟确保音频状态完全重置
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 设置播放速度
      audio.playbackRate = playbackRate;
      
      // 设置当前播放的音频
      this.currentlyPlaying = audio;
      
      console.log(`[Audio] 开始播放音频: ${audioName}, 播放速率: ${playbackRate}, readyState: ${audio.readyState}`);
      
      // Android环境下的播放重试机制
      if (this.isAndroid) {
        await this.playWithRetry(audio, audioName);
      } else {
        await audio.play();
        
        // 等待音频播放完成
        await new Promise<void>((resolve) => {
          const onEnded = () => {
            audio.removeEventListener('ended', onEnded);
            // 清除当前播放状态
            if (this.currentlyPlaying === audio) {
              this.currentlyPlaying = null;
            }
            resolve();
          };
          audio.addEventListener('ended', onEnded);
          
          // 如果音频已经播放完成，立即resolve
          if (audio.ended) {
            if (this.currentlyPlaying === audio) {
              this.currentlyPlaying = null;
            }
            resolve();
          }
        });
      }
      
      console.log(`默认音频播放成功: ${audioName}`);
    } catch (error) {
      console.warn(`播放默认音频失败: ${audioName}`, error);
      // 播放失败时清除当前播放状态
      this.currentlyPlaying = null;
    }
  }

  /**
   * Android环境下的音频播放重试机制
   */
  private async playWithRetry(audio: HTMLAudioElement, audioName: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await audio.play();
        
        // 等待音频播放完成
        await new Promise<void>((resolve) => {
          const onEnded = () => {
            audio.removeEventListener('ended', onEnded);
            // 清除当前播放状态
            if (this.currentlyPlaying === audio) {
              this.currentlyPlaying = null;
            }
            resolve();
          };
          audio.addEventListener('ended', onEnded);
          
          // 如果音频已经播放完成，立即resolve
          if (audio.ended) {
            if (this.currentlyPlaying === audio) {
              this.currentlyPlaying = null;
            }
            resolve();
          }
        });
        
        return; // 播放成功，退出重试
      } catch (error) {
        console.warn(`音频播放重试 ${i + 1}/${maxRetries}: ${audioName}`, error);
        
        if (i < maxRetries - 1) {
          // 等待一段时间后重试
          await this.delay(200 * (i + 1));
          
          // 重置音频状态而不是重新加载
          audio.currentTime = 0;
          if (!audio.paused) {
            audio.pause();
          }
        } else {
          throw error; // 最后一次重试失败，抛出错误
        }
      }
    }
  }

  /**
   * 播放数字语音
   * @param num 要播放的数字
   * @param options.fast 快速模式（用于结果播报，语速更快、片段间隔更短）
   */
  public async playNumber(num: number, options?: { fast?: boolean }): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const currentProfile = this.voiceProfiles.find(p => p.id === this.currentVoiceProfile);
    const isCustomProfile = currentProfile?.type === 'custom';

    if (isHarmonyOS() && !isCustomProfile) {
      const appWindow = window as AppWindow;
      if (appWindow.HarmonyBridge?.audio?.playNumber) {
        console.log(`[AudioPlayer] 鸿蒙环境且非自定义语音，调用原生播报数字: ${num}`);
        appWindow.HarmonyBridge.audio.playNumber(num);
        return;
      }
    }

    const fast = options?.fast ?? false;
    const playbackRate = fast ? 1.7 : 1.0;
    // 结果播报（fast）优先使用本地录音片段，避免多次 TTS 调度造成卡顿/断续
    const preferRecorded = fast;

    // 处理简单的0-10整数，优先使用中文数字音频
    if (Number.isInteger(num) && num >= 0 && num <= 10) {
      await this.playNumberToken(`num${num}`, playbackRate, preferRecorded);
      return;
    }

    // 处理复杂数字（多位数、小数、负数）
    await this.playChineseNumber(num, fast, preferRecorded);
  }

  /**
   * 播放时间语音（替代TTS，使用已有的数字和点读音，支持自定义语音）
   */
  public async playTime(hour: number, minute: number, options?: { fast?: boolean }): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const fast = options?.fast ?? false;
    const playbackRate = fast ? 1.7 : 1.0;
    const preferRecorded = fast;

    // 播放小时
    await this.playChineseNumber(hour, fast, preferRecorded);
    await this.delay(this.delayMs(200, fast));
    
    // 播放 "点"
    await this.playNumberToken('dian', playbackRate, preferRecorded);
    
    if (minute === 0) {
      // 只需要说 "X点"
      return;
    }
    
    await this.delay(this.delayMs(200, fast));
    // 处理分钟的特殊情况：比如 8:05 应该读作 "八点零五"
    if (minute > 0 && minute < 10) {
      await this.playNumberToken('num0', playbackRate, preferRecorded);
      await this.delay(this.delayMs(200, fast));
      await this.playChineseNumber(minute, fast, preferRecorded);
    } else {
      await this.playChineseNumber(minute, fast, preferRecorded);
    }
  }

  /**
   * 播放英文数字语音
   */
  public async playEnglishNumber(num: number): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const englishNumberMap: Record<number, string> = {
      0: 'zero',
      1: 'one',
      2: 'two',
      3: 'three',
      4: 'four',
      5: 'five',
      6: 'six',
      7: 'seven',
      8: 'eight',
      9: 'nine'
    };

    const audioName = englishNumberMap[num];
    if (audioName) {
      await this.playAudio(audioName);
    }
  }

  /** 快速模式下显著压缩停顿，提升结果播报连贯性 */
  private delayMs(ms: number, fast?: boolean): number {
    return fast ? Math.max(18, Math.round(ms * 0.28)) : ms;
  }

  /**
   * 播放数字片段（可选优先录音）
   * fast 模式下优先本地录音，可避免 TTS 多次启动导致断续
   */
  private async playNumberToken(
    audioName: string,
    playbackRate: number,
    preferRecorded?: boolean,
  ): Promise<void> {
    if (preferRecorded) {
      try {
        await this.playDefaultAudio(audioName, playbackRate);
        return;
      } catch (error) {
        console.warn(`数字片段本地播放失败，回退通用链路: ${audioName}`, error);
      }
    }
    await this.playAudio(audioName, playbackRate);
  }

  /**
   * 播放中文数字语音（支持正确的中文数字组合）
   * @param fast 快速模式：语速 2.0x，片段间隔缩短
   */
  private async playChineseNumber(num: number, fast?: boolean, preferRecorded?: boolean): Promise<void> {
    const isCompositeNumber = num >= 11;
    const playbackRate = fast ? 1.7 : (isCompositeNumber ? 1.1 : 1.0);
    const d = (ms: number) => this.delay(this.delayMs(ms, fast));

    if (num < 0) {
      await this.playNumberToken('fu', playbackRate, preferRecorded);
      await d(250);
      await this.playChineseNumber(-num, fast, preferRecorded);
      return;
    }

    if (num % 1 !== 0) {
      const parts = num.toString().split('.');
      await this.playChineseNumber(parseInt(parts[0]), fast, preferRecorded);
      await d(250);
      await this.playNumberToken('dian', playbackRate, preferRecorded);
      await d(400);
      for (const digit of parts[1]) {
        await this.playNumberToken(`num${digit}`, playbackRate, preferRecorded);
        await d(180);
      }
      return;
    }

    if (num === 0) {
      await this.playNumberToken('num0', playbackRate, preferRecorded);
      return;
    }

    if (num >= 1 && num <= 10) {
      await this.playNumberToken(`num${num}`, playbackRate, preferRecorded);
      return;
    }

    if (num === 10) {
      await this.playNumberToken('shi', playbackRate, preferRecorded);
      return;
    }

    if (num >= 11 && num <= 19) {
      await this.playNumberToken('shi', playbackRate, preferRecorded);
      await d(250);
      await this.playNumberToken(`num${num - 10}`, playbackRate, preferRecorded);
      return;
    }

    if (num >= 20 && num <= 99) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      await this.playNumberToken(`num${tens}`, playbackRate, preferRecorded);
      await d(400);
      await this.playNumberToken('shi', playbackRate, preferRecorded);
      if (ones > 0) {
        await d(250);
        await this.playNumberToken(`num${ones}`, playbackRate, preferRecorded);
      }
      return;
    }

    if (num >= 100 && num <= 999) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      await this.playNumberToken(`num${hundreds}`, playbackRate, preferRecorded);
      await d(400);
      await this.playNumberToken('bai', playbackRate, preferRecorded);
      if (remainder > 0) {
        await d(400);
        if (remainder < 10) {
          await this.playNumberToken('num0', playbackRate, preferRecorded);
          await d(400);
          await this.playNumberToken(`num${remainder}`, playbackRate, preferRecorded);
        } else if (remainder >= 10 && remainder <= 19) {
          await this.playNumberToken('num1', playbackRate, preferRecorded);
          await d(400);
          await this.playNumberToken('shi', playbackRate, preferRecorded);
          if (remainder > 10) {
            await d(400);
            await this.playNumberToken(`num${remainder - 10}`, playbackRate, preferRecorded);
          }
        } else {
          await this.playChineseNumber(remainder, fast, preferRecorded);
        }
      }
      return;
    }

    if (num >= 1000 && num <= 9999) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      await this.playNumberToken(`num${thousands}`, playbackRate, preferRecorded);
      await d(400);
      await this.playNumberToken('qian', playbackRate, preferRecorded);
      if (remainder > 0) {
        await d(400);
        if (remainder < 100) {
          await this.playNumberToken('num0', playbackRate, preferRecorded);
          await d(400);
        }
        await this.playChineseNumber(remainder, fast, preferRecorded);
      }
      return;
    }

    if (num >= 10000 && num <= 99999999) {
      const wanPart = Math.floor(num / 10000);
      const remainder = num % 10000;
      await this.playChineseNumber(wanPart, fast, preferRecorded);
      await d(400);
      await this.playNumberToken('wan', playbackRate, preferRecorded);
      if (remainder > 0) {
        await d(400);
        if (remainder < 1000) {
          await this.playNumberToken('num0', playbackRate, preferRecorded);
          await d(400);
        }
        await this.playChineseNumber(remainder, fast, preferRecorded);
      }
      return;
    }

    if (num >= 100000000) {
      const yiPart = Math.floor(num / 100000000);
      const remainder = num % 100000000;
      await this.playChineseNumber(yiPart, fast, preferRecorded);
      await d(400);
      await this.playNumberToken('yi', playbackRate, preferRecorded);
      if (remainder > 0) {
        await d(400);
        if (remainder < 10000000) {
          await this.playNumberToken('num0', playbackRate, preferRecorded);
          await d(400);
        }
        await this.playChineseNumber(remainder, fast, preferRecorded);
      }
      return;
    }

    await this.playComplexNumber(num, fast, preferRecorded);
  }

  /**
   * 播放复杂数字语音（逐位播放，作为备用方案）
   */
  private async playComplexNumber(num: number, fast?: boolean, preferRecorded?: boolean): Promise<void> {
    const numStr = num.toString();
    const playbackRate = fast ? 1.7 : 1.0;
    
    for (let i = 0; i < numStr.length; i++) {
      const char = numStr[i];
      
      if (char === '-') {
        await this.playNumberToken('fu', playbackRate, preferRecorded);
      } else if (char === '.') {
        await this.playNumberToken('dian', playbackRate, preferRecorded);
      } else if (char >= '0' && char <= '9') {
        await this.playNumberToken(`num${char}`, playbackRate, preferRecorded);
      }
      
      if (i < numStr.length - 1) {
        await this.delay(this.delayMs(400, fast));
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      this.pendingTimeouts.add(timeout);
      setTimeout(() => {
        this.pendingTimeouts.delete(timeout);
      }, ms);
    });
  }

  /**
   * 创建可取消的延迟
   */
  public createCancelableDelay(ms: number, callback: () => void): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      this.pendingTimeouts.delete(timeout);
      callback();
    }, ms);
    this.pendingTimeouts.add(timeout);
    return timeout;
  }

  /**
   * 取消指定的延迟
   */
  public cancelDelay(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.pendingTimeouts.delete(timeout);
  }

  /**
   * 播放运算符语音
   */
  public async playOperator(operator: string): Promise<void> {
    const operatorMap: Record<string, string> = {
      '+': 'jia',
      '-': 'jian', 
      '*': 'chengyi',
      '×': 'chengyi',
      '÷': 'chuyi',
      // 常见英文/别名补充
      'add': 'jia',
      'plus': 'jia',
      'addition': 'jia',
      'subtract': 'jian',
      'minus': 'jian',
      'subtraction': 'jian',
      'multiply': 'chengyi',
      'times': 'chengyi',
      'multiple': 'chengyi',
      'divide': 'chuyi',
      'division': 'chuyi',
      '=': 'dengyu',
      '≈': 'yuedengyu',
      '~': 'yuedengyu',
      'approx': 'yuedengyu',
      'yuedengyu': 'yuedengyu',
      '>': 'dayu',
      '<': 'xiaoyu',
      'equals': 'dengyu',
      '.': 'dian',
      '%': 'baifenhao',
      // 其他英文关键词
      'equal': 'dengyu',
      'dot': 'dot',
      'percent': 'percent',
      'minus_sign': 'minus_sign',
      // 功能键
      'clear': 'clear',
      'delete': 'del',
      'backspace': 'del',
      'del': 'del',
    };

    const audioName = operatorMap[operator] || operator;

    const currentProfile = this.voiceProfiles.find(p => p.id === this.currentVoiceProfile);
    const isCustomProfile = currentProfile?.type === 'custom';

    if (isHarmonyOS() && !isCustomProfile) {
      const appWindow = window as AppWindow;
      if (appWindow.HarmonyBridge?.audio) {
        console.log(`[AudioPlayer] 鸿蒙环境且非自定义语音，解析并播放运算符: ${operator} -> ${audioName}`);
        
        if (audioName === 'del' || audioName === 'delete' || audioName === 'clear') {
          appWindow.HarmonyBridge.audio.playDelete();
          return;
        }

        if (audioName === 'yuedengyu') {
          if (appWindow.HarmonyBridge.audio.speakText) {
            appWindow.HarmonyBridge.audio.speakText('约等于');
          }
          return;
        }

        const nativeOperatorMap: Record<string, string> = {
          'jia': '+',
          'jian': '-',
          'chengyi': '*',
          'chuyi': '/',
          'dengyu': '=',
          'dian': '.',
          'dayu': '>',
          'xiaoyu': '<'
        };
        
        const nativeOp = nativeOperatorMap[audioName] || audioName;
        appWindow.HarmonyBridge.audio.playOperator(nativeOp);
        return;
      }
    }

    console.log(`[Audio] [DEBUG] 播放运算符: ${operator} -> ${audioName}`);
    console.log(`[Audio] [DEBUG] 音频启用状态: ${this.isEnabled}`);
    console.log(`[Audio] [DEBUG] 当前语音配置: ${this.currentVoiceProfile}`);

    // “约等于”无预存本地录音，直接走 TTS 朗读
    if (audioName === 'yuedengyu') {
      try {
        await this.speakText('约等于');
      } catch (err) {
        console.warn('播放约等于失败:', err);
      }
      return;
    }
    
    if (audioName) {
      console.log(`[Audio] [DEBUG] 开始播放运算符音频: ${audioName}`);
      
      // 检查缓存状态
      const cachedAudio = this.audioCache.get(audioName);
      if (cachedAudio) {
        console.log(`[Audio] [DEBUG] 缓存音频状态 - readyState: ${cachedAudio.readyState}, networkState: ${cachedAudio.networkState}, error: ${cachedAudio.error}`);
      } else {
        console.log(`[Audio] [DEBUG] 音频未缓存: ${audioName}`);
      }
      
      try {
        // 运算符优先播本地录音文件，避免某些机型 TTS 对符号词条（如“等于”）漏播
        await this.playDefaultAudio(audioName);
        console.log(`[Audio] [DEBUG] 运算符音频播放完成: ${audioName}`);
      } catch (error) {
        console.warn(`[Audio] [WARN] 本地运算符音频播放失败，回退到通用播放链路: ${audioName}`, error);
        try {
          await this.playAudio(audioName);
          console.log(`[Audio] [DEBUG] 运算符回退播放完成: ${audioName}`);
        } catch (fallbackError) {
          console.error(`[Audio] [ERROR] 运算符音频回退后仍失败: ${audioName}`, fallbackError);
          // 不重新抛出错误，避免阻断后续播放
          console.log(`[Audio] [DEBUG] 音频播放失败但继续执行，不阻断后续操作`);
        }
      }
    } else {
      console.warn(`[Audio] [WARN] 未找到运算符映射: ${operator}`);
    }
  }

  /**
   * 播放中文数字单位
   */
  public async playChineseUnit(unit: string): Promise<void> {
    const unitMap: Record<string, string> = {
      '十': 'shi',
      '百': 'bai', 
      '千': 'qian',
      '万': 'wan',
      '亿': 'yi'
    };

    const audioName = unitMap[unit];
    if (audioName) {
      await this.playAudio(audioName);
    }
  }

  /**
   * 播放删除音效
   */
  public async playDelete(): Promise<void> {
    const currentProfile = this.voiceProfiles.find(p => p.id === this.currentVoiceProfile);
    const isCustomProfile = currentProfile?.type === 'custom';

    if (isHarmonyOS() && !isCustomProfile) {
      const appWindow = window as AppWindow;
      if (appWindow.HarmonyBridge?.audio?.playDelete) {
        console.log('[AudioPlayer] 鸿蒙环境且非自定义语音，调用原生播报删除');
        appWindow.HarmonyBridge.audio.playDelete();
        return;
      }
    }
    await this.playAudio('del');
  }

  /**
   * 设置音频开关
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 获取音频开关状态
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 停止所有正在播放的音频
   */
  public stopAllAudio(): void {
    console.log('[Audio] [停止] 停止所有音频播放');
    
    // 清除所有待处理的延迟
    this.pendingTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.pendingTimeouts.clear();
    console.log('[Audio] [停止] 清除所有待处理的延迟');
    
    // 停止当前正在播放的音频
    if (this.currentlyPlaying && !this.currentlyPlaying.paused) {
      console.log('[Audio] [停止] 停止当前播放的音频');
      this.currentlyPlaying.pause();
      this.currentlyPlaying.currentTime = 0;
      this.currentlyPlaying = null;
    }
    
    // 停止缓存中的所有音频
    this.audioCache.forEach((audio, audioName) => {
      if (audio && !audio.paused) {
        console.log(`[停止] 停止音频: ${audioName}`);
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    // 停止自定义音频缓存中的所有音频
    this.customAudioCache.forEach((audio, audioName) => {
      if (audio && !audio.paused) {
        console.log(`[停止] 停止自定义音频: ${audioName}`);
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    
    // 停止原生TTS
    if (TextToSpeech) {
      TextToSpeech.stop().catch(console.warn);
    }
  }

  private hasPreloadedCommonAudios = false;

  /**
   * 预加载所有常用音频（空闲分批加载，避免冷启动瞬时争抢主线程与 IO）
   */
  public preloadCommonAudios(): void {
    if (this.hasPreloadedCommonAudios || isHarmonyOS()) {
      return;
    }
    this.hasPreloadedCommonAudios = true;

    // 分批次音频队列
    const audioBatches: string[][] = [
      // 第一批：最核心的 0-10 数字与常用键
      ['num0', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9', 'num10', 'del', 'dengyu'],
      // 第二批：基础常用中文运算符与单位
      ['jia', 'jian', 'chengyi', 'chuyi', 'dian', 'baifenhao', 'fu', 'shi', 'bai', 'qian', 'wan', 'yi'],
      // 第三批：英文数字与运算符及其他
      ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'add', 'subtraction', 'multiple', 'division', 'equal', 'dot', 'percent', 'minus_sign', 'fenhao', 'e', 'shuzibai']
    ];

    const runBatch = (index: number) => {
      if (index >= audioBatches.length) return;
      const batch = audioBatches[index];
      batch.forEach(name => this.preloadAudio(name));

      // 调度下一批次
      if (index + 1 < audioBatches.length) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => runBatch(index + 1), { timeout: 2000 });
        } else {
          setTimeout(() => runBatch(index + 1), 600);
        }
      }
    };

    // 延迟到首屏渲染完成后的空闲期开始执行第一批
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => runBatch(0), { timeout: 2500 });
    } else {
      setTimeout(() => runBatch(0), 1000);
    }
  }
}

// 导出单例实例
export const audioPlayer = AudioPlayer.getInstance();
