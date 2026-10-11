import { Capacitor } from '@capacitor/core';

type PermissionNoticeLevel = 'info' | 'warning' | 'error';
type PermissionNoticeHandler = (message: string, level: PermissionNoticeLevel) => void;

/**
 * Android 权限管理器
 * 确保只有在用户同意隐私协议后才申请权限
 */
export class AndroidPermissionManager {
  private static instance: AndroidPermissionManager;
  private static noticeHandler: PermissionNoticeHandler | null = null;
  private hasPrivacyConsent = false;

  private constructor() {
    // 检查隐私同意状态
    this.checkPrivacyConsent();
  }

  static getInstance(): AndroidPermissionManager {
    if (!AndroidPermissionManager.instance) {
      AndroidPermissionManager.instance = new AndroidPermissionManager();
    }
    return AndroidPermissionManager.instance;
  }

  static setNoticeHandler(handler: PermissionNoticeHandler | null): void {
    AndroidPermissionManager.noticeHandler = handler;
  }

  private checkPrivacyConsent(): void {
    const consent = localStorage.getItem('privacy_accepted');
    this.hasPrivacyConsent = consent === 'true';
  }

  private notify(message: string, level: PermissionNoticeLevel = 'warning'): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('chmath:permission-notice', {
          detail: { message, level },
        }),
      );
    }

    if (AndroidPermissionManager.noticeHandler) {
      AndroidPermissionManager.noticeHandler(message, level);
    } else if (level === 'error') {
      console.error(message);
    } else if (level === 'warning') {
      console.warn(message);
    } else {
      console.info(message);
    }
  }

  /**
   * 更新隐私同意状态
   * @param consent 是否同意隐私协议
   */
  updatePrivacyConsent(consent: boolean): void {
    this.hasPrivacyConsent = consent;
  }

  /**
   * 请求麦克风权限（用于语音识别）
   * 只有在用户同意隐私协议后才会申请
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (!this.hasPrivacyConsent) {
      console.warn('用户未同意隐私协议，无法申请麦克风权限');
      this.showPrivacyRequiredAlert('麦克风');
      return false;
    }

    if (!Capacitor.isNativePlatform()) {
      // Web环境，通过浏览器API申请权限
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // 立即停止，仅用于权限检查
        console.info('Web麦克风权限申请成功');
        return true;
      } catch (error) {
        console.error('Web麦克风权限申请失败:', error);
        this.showPermissionDeniedAlert('麦克风', '语音计算功能将无法使用');
        return false;
      }
    }

    // 原生平台，权限在AndroidManifest.xml中声明为运行时权限
    // Android 6.0+ 会在首次使用时自动弹出系统权限对话框
    console.info('原生平台：麦克风权限将在首次使用时申请');
    return true;
  }

  /**
   * 检查麦克风权限状态
   */
  async checkMicrophonePermission(): Promise<boolean> {
    if (!this.hasPrivacyConsent) {
      return false;
    }

    if (!Capacitor.isNativePlatform()) {
      // Web环境检查
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return result.state === 'granted';
      } catch (error) {
        console.warn('无法检查Web麦克风权限状态:', error);
        return false;
      }
    }

    // 原生平台，假设权限可用（实际会在使用时检查）
    return true;
  }

  /**
   * 请求存储权限（如果需要）
   */
  async requestStoragePermission(): Promise<boolean> {
    if (!this.hasPrivacyConsent) {
      console.warn('用户未同意隐私协议，无法申请存储权限');
      this.showPrivacyRequiredAlert('存储');
      return false;
    }

    if (!Capacitor.isNativePlatform()) {
      // Web环境通常不需要显式申请存储权限
      return true;
    }

    // 原生平台，现代Android版本通常使用作用域存储，不需要显式权限
    console.info('原生平台：使用作用域存储，无需申请存储权限');
    return true;
  }

  /**
   * 检查是否有权限申请权限（即是否已同意隐私协议）
   */
  canRequestPermissions(): boolean {
    return this.hasPrivacyConsent;
  }

  /**
   * 显示隐私协议要求提醒
   */
  private showPrivacyRequiredAlert(permissionName: string): void {
    const message = `请先同意隐私协议才能申请${permissionName}权限。请重启应用并同意隐私协议。`;
    this.notify(message, 'warning');
  }

  /**
   * 显示权限被拒绝提醒
   */
  private showPermissionDeniedAlert(permissionName: string, consequence: string): void {
    const message = `${permissionName}权限被拒绝，${consequence}。您可以在设置中手动开启权限。`;
    this.notify(message, 'warning');
  }

  /**
   * 显示权限说明对话框
   */
  showPermissionRationale(permissionType: 'microphone' | 'storage'): void {
    if (!this.hasPrivacyConsent) {
      this.showPrivacyRequiredAlert(permissionType === 'microphone' ? '麦克风' : '存储');
      return;
    }

    const messages = {
      microphone: '为了使用语音计算功能，我们需要访问您的麦克风。这将帮助识别您的语音输入，让计算更加便捷。您的语音数据不会被上传或存储。',
      storage: '为了保存您的学习进度和设置，我们需要访问设备存储。您的数据将只存储在本地设备上，不会被上传。'
    };

    const message = messages[permissionType];
    this.notify(message, 'info');
  }

  /**
   * 获取权限状态说明文本
   */
  getPermissionStatusText(hasPermission: boolean, permissionType: string): string {
    if (!this.hasPrivacyConsent) {
      return `请先同意隐私协议才能使用${permissionType}功能`;
    }
    
    return hasPermission 
      ? `${permissionType}权限已获取，可以正常使用相关功能`
      : `${permissionType}权限未获取，相关功能可能无法使用。您可以在系统设置中手动开启权限。`;
  }
}
