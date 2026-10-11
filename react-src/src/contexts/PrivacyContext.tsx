import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdControl } from '@/native/adControl';
import { AndroidPermissionManager } from '@/utils/AndroidPermissionManager';
import { isHarmonyOS } from '@/lib/platform';

interface PrivacyContextType {
  hasAccepted: boolean;
  isLoading: boolean;
  acceptPrivacy: () => Promise<void>;
  rejectPrivacy: () => void;
  showPrivacyDialog: boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

interface PrivacyProviderProps {
  children: ReactNode;
}

type LegacyAdControlPlugin = {
  setConsent?: (options: { consent: boolean }) => Promise<unknown> | unknown;
};

type CapacitorWithLegacyPlugins = typeof Capacitor & {
  Plugins?: {
    AdControl?: LegacyAdControlPlugin;
  };
};

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState<boolean>(false);

  const syncNativeConsent = useCallback(async (consent: boolean) => {
    try {
      console.log('[PrivacyContext] syncNativeConsent called with consent:', consent);

      // 鸿蒙环境：通过 AdControl / HarmonyBridge 同步隐私授权
      if (isHarmonyOS()) {
        console.log('[PrivacyContext] 鸿蒙环境，向原生发送隐私同意状态');
        try {
          await AdControl.setConsent({ consent });
        } catch (e) {
          console.warn('[PrivacyContext] 鸿蒙环境调用 AdControl.setConsent 失败:', e);
        }
        return;
      }

      console.log('[PrivacyContext] isNativePlatform:', Capacitor.isNativePlatform());

      if (!Capacitor.isNativePlatform()) {
        console.log('[PrivacyContext] Not native platform, skip native sync');
        return;
      }

      // 优先使用 registerPlugin 方式
      let called = false;
      try {
        console.log('[PrivacyContext] Calling AdControl.setConsent via registerPlugin');
        const res = await AdControl.setConsent({ consent });
        console.log('[PrivacyContext] AdControl.setConsent result:', res);
        called = true;
      } catch (e) {
        console.warn('[PrivacyContext] registerPlugin call failed:', e);
      }

      // 兼容直接访问 Capacitor.Plugins 的方式（部分设备上更可靠）
      if (!called) {
        try {
          const legacy = (Capacitor as CapacitorWithLegacyPlugins)?.Plugins?.AdControl;
          console.log('[PrivacyContext] Fallback Capacitor.Plugins.AdControl:', !!legacy);
          if (legacy && typeof legacy.setConsent === 'function') {
            const res2 = await legacy.setConsent({ consent });
            console.log('[PrivacyContext] Fallback setConsent result:', res2);
            called = true;
          }
        } catch (e2) {
          console.warn('[PrivacyContext] Fallback call failed:', e2);
        }
      }

      if (!called) {
        console.error('[PrivacyContext] 无可用的 AdControl.setConsent 实现');
      }
    } catch (error) {
      console.error('[PrivacyContext] 同步原生隐私同意状态失败:', error);
    }
  }, []);

  const checkPrivacyStatus = useCallback(async () => {
    try {
      console.log('[PrivacyContext] checkPrivacyStatus called');
      // 检查本地存储的隐私协议状态
      const accepted = localStorage.getItem('privacy_accepted');
      const hasAcceptedPrivacy = accepted === 'true';
      console.log('[PrivacyContext] localStorage privacy_accepted:', accepted, 'hasAcceptedPrivacy:', hasAcceptedPrivacy);

      setHasAccepted(hasAcceptedPrivacy);
      setShowPrivacyDialog(!hasAcceptedPrivacy);
      setIsLoading(false);

      // 通知权限管理器当前的隐私同意状态（鸿蒙环境下也可用）
      AndroidPermissionManager.getInstance().updatePrivacyConsent(hasAcceptedPrivacy);

      // 前端启动后只在已同意的情况下同步一次到原生，确保覆盖安装后也能读取到同意状态
      // 如果未同意，不要同步 false 给原生（原生层收到 false 会直接 System.exit 杀掉应用）
      if (hasAcceptedPrivacy) {
        console.log('[PrivacyContext] About to call syncNativeConsent with: true');
        await syncNativeConsent(true);
        console.log('[PrivacyContext] syncNativeConsent completed');
      } else {
        console.log('[PrivacyContext] User has not consented yet, deferring sync until user decision');
      }
    } catch (error) {
      console.error('[PrivacyContext] 检查隐私状态失败:', error);
      setHasAccepted(false);
      setShowPrivacyDialog(true);
      setIsLoading(false);
    }
  }, [syncNativeConsent]);

  useEffect(() => {
    checkPrivacyStatus();
  }, [checkPrivacyStatus]);

  const acceptPrivacy = async () => {
    try {
      localStorage.setItem('privacy_accepted', 'true');
      setHasAccepted(true);
      setShowPrivacyDialog(false);

      // 通知权限管理器用户已同意隐私协议
      AndroidPermissionManager.getInstance().updatePrivacyConsent(true);
      await syncNativeConsent(true);

      console.info('用户同意隐私协议，现在可以申请必要权限');
    } catch (error) {
      console.error('保存隐私协议状态失败:', error);
    }
  };

  const rejectPrivacy = () => {
    console.info('用户拒绝隐私协议');
    // 尝试关闭窗口（可能被浏览器阻止）
    window.close();
    // 如果无法关闭，重定向到空白页
    window.location.href = 'about:blank';
  };

  const value: PrivacyContextType = {
    hasAccepted,
    isLoading,
    acceptPrivacy,
    rejectPrivacy,
    showPrivacyDialog,
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};
