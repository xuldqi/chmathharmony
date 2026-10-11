import { AdControlPlugin } from './adControl';

export class AdControlWeb implements AdControlPlugin {
  async setConsent(options: { consent: boolean }): Promise<{ status: string; consent: boolean }> {
    console.log('[AdControlWeb] setConsent called', options);
    try {
      if (typeof window !== 'undefined' && (window as any).HarmonyBridgeNative) {
        (window as any).HarmonyBridgeNative.postMessage('ad_setConsent', JSON.stringify(options));
      }
    } catch (e) {
      console.warn('[AdControlWeb] Failed to notify HarmonyBridgeNative', e);
    }
    return { status: 'ok', consent: options.consent };
  }

  async showInterstitial(): Promise<{ status: string } | void> {
    console.log('[AdControlWeb] showInterstitial called');
    try {
      if (typeof window !== 'undefined' && (window as any).HarmonyBridgeNative) {
        (window as any).HarmonyBridgeNative.postMessage('ad_showInterstitial', '{}');
      }
    } catch (e) {
      console.warn('[AdControlWeb] Failed to notify HarmonyBridgeNative', e);
    }
    return { status: 'ok' };
  }

  async openAppMarket(options: { pkgName: string }): Promise<void> {
    console.log('[AdControlWeb] openAppMarket called', options);
    try {
      if (typeof window !== 'undefined') {
        window.location.href = `market://details?id=${options.pkgName}`;
      }
    } catch (e) {
      console.warn('[AdControlWeb] Failed to open market', e);
    }
  }
}

