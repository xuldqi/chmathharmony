/**
 * 平台检测工具
 */

type HarmonyWindow = Window & {
  HarmonyBridge?: unknown;
};

export const isHarmonyOS = (): boolean => {
  return !!(window as HarmonyWindow).HarmonyBridge;
};

export const isWeb = (): boolean => {
  return !isHarmonyOS();
};

export const getPlatform = (): 'harmonyos' | 'web' => {
  return isHarmonyOS() ? 'harmonyos' : 'web';
};

export const waitForPlatformReady = (): Promise<void> => {
  return new Promise((resolve) => {
    const harmonyWindow = window as HarmonyWindow;
    if (isHarmonyOS()) {
      // 等待HarmonyBridge就绪
      const checkReady = () => {
        if (harmonyWindow.HarmonyBridge) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    } else {
      // Web环境立即就绪
      resolve();
    }
  });
};
