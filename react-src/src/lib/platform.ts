/**
 * 平台检测工具
 * 用于判断当前运行环境
 */

/**
 * 检测是否在鸿蒙环境下运行
 */
export function isHarmonyOS(): boolean {
  // 1. 如果有明确的鸿蒙桥接对象，绝对是鸿蒙原生环境
  if (typeof window !== 'undefined' && ((window as any).HarmonyBridge || (window as any).HarmonyBridgeNative)) {
    return true;
  }

  // 2. 如果是真正的 Capacitor 原生环境 (Android/iOS)，则不是鸿蒙原生环境
  if (typeof window !== 'undefined' && (window as any).Capacitor && typeof (window as any).Capacitor.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform()) {
    return false;
  }

  // 3. 根据 UA 判断 (可能是鸿蒙浏览器，或者是没有正确注入 Bridge 的鸿蒙环境)
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('harmony') || ua.includes('huawei')) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检测是否在 Capacitor 原生环境 (Android/iOS) 下运行
 */
export function isCapacitor(): boolean {
  if (typeof window !== 'undefined') {
    const cap = (window as any).Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function') {
      return cap.isNativePlatform();
    }
  }
  return false;
}

/**
 * 检测是否在 Android 原生环境下运行
 */
export function isAndroid(): boolean {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('android') && !isHarmonyOS();
  }
  return false;
}

/**
 * 检测是否在 iOS 原生环境下运行
 */
export function isIOS(): boolean {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('iphone') || ua.includes('ipad');
  }
  return false;
}

/**
 * 检测是否在原生移动应用环境下运行
 */
export function isNativeApp(): boolean {
  return isHarmonyOS() || isCapacitor();
}

/**
 * 检测是否在 Web 浏览器环境下运行
 */
export function isWebBrowser(): boolean {
  return !isNativeApp();
}

/**
 * 获取当前平台名称
 */
export function getPlatformName(): string {
  if (isHarmonyOS()) return 'harmonyos';
  if (isAndroid()) return 'android';
  if (isIOS()) return 'ios';
  return 'web';
}
