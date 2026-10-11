import { registerPlugin } from '@capacitor/core';

export interface AdControlPlugin {
  setConsent(options: { consent: boolean }): Promise<{ status: string; consent: boolean }>;
  showInterstitial(): Promise<{ status: string } | void>;
  openAppMarket(options: { pkgName: string }): Promise<void>;
}

export const AdControl = registerPlugin<AdControlPlugin>('AdControl', {
  web: () => import('./web').then(m => new m.AdControlWeb()),
});


