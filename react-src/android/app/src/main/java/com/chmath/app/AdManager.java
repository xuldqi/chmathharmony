package com.chmath.app;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConfig;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdLoadType;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAdSdk;
import com.bytedance.sdk.openadsdk.TTCustomController;
import com.bytedance.sdk.openadsdk.TTFullScreenVideoAd;

import java.util.Map;

/** 穿山甲插屏广告管理。所有 SDK 初始化必须在用户同意隐私政策后执行。 */
public final class AdManager {
    private static final String TAG = "AdManager";
    private static final String APP_ID = "5746047";
    private static final String APP_NAME = "语音计算器";
    private static final String INTERSTITIAL_CODE_ID = "972630238";
    private static final long SHOW_INTERVAL_MS = 60_000L;
    private static final long AD_EXPIRE_SAFETY_MS = 5 * 60_000L;

    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static Activity currentActivity;
    private static Context appContext;
    private static boolean consented;
    private static boolean initializing;
    private static boolean initialized;
    private static boolean loading;
    private static boolean showing;
    private static long lastShowTime;
    private static TTFullScreenVideoAd cachedInterstitialAd;
    private static long cachedAt;

    private AdManager() {}

    public static void setCurrentActivity(Activity activity) {
        currentActivity = activity;
    }

    public static void initializeIfConsented(Context context, boolean consented) {
        AdManager.consented = consented;
        if (context != null) {
            appContext = context.getApplicationContext();
        }
        if (!consented) {
            Log.d(TAG, "Skip Pangle init: privacy consent not granted");
            clearAd();
            return;
        }
        if (appContext == null) {
            Log.w(TAG, "Skip Pangle init: context is null");
            return;
        }
        runOnMain(() -> {
            if (initialized || initializing || TTAdSdk.isInitSuccess()) {
                initialized = initialized || TTAdSdk.isInitSuccess();
                return;
            }

            initializing = true;
            TTAdConfig config = new TTAdConfig.Builder()
                .appId(APP_ID)
                .appName(APP_NAME)
                .paid(false)
                .allowShowNotify(false)
                .debug(isDebuggable(appContext))
                .supportMultiProcess(false)
                .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_NO_TITLE_BAR)
                .setAgeGroup(TTAdConstant.MINOR)
                .useMediation(false)
                .customController(new TTCustomController() {
                    @Override
                    public boolean isCanUseLocation() {
                        return false;
                    }

                    @Override
                    public boolean isCanUsePhoneState() {
                        return false;
                    }

                    @Override
                    public boolean isCanUseWifiState() {
                        return true;
                    }

                    @Override
                    public boolean isCanUseWriteExternal() {
                        return false;
                    }

                    @Override
                    public boolean isCanUseAndroidId() {
                        return true;
                    }

                    @Override
                    public boolean isCanUsePermissionRecordAudio() {
                        return false;
                    }

                    @Override
                    public boolean isCanUseMessage() {
                        return false;
                    }

                    @Override
                    public String getDevImei() {
                        return "";
                    }

                    @Override
                    public String getMacAddress() {
                        return "";
                    }

                    @Override
                    public String getDevOaid() {
                        return "";
                    }

                    @Override
                    public Map<String, Object> userPrivacyConfig() {
                        return null;
                    }
                })
                .build();

            try {
                boolean initResult = TTAdSdk.init(appContext, config);
                Log.d(TAG, "Pangle init requested, result=" + initResult);
                TTAdSdk.start(new TTAdSdk.Callback() {
                    @Override
                    public void success() {
                        initializing = false;
                        initialized = true;
                        Log.d(TAG, "Pangle init success, sdk=" + TTAdSdk.getAdManager().getSDKVersion());
                        loadInterstitialAds(currentActivity);
                    }

                    @Override
                    public void fail(int code, String message) {
                        initializing = false;
                        initialized = false;
                        Log.w(TAG, "Pangle init failed: " + code + ", " + message);
                    }
                });
            } catch (Throwable t) {
                initializing = false;
                initialized = false;
                Log.e(TAG, "Pangle init error", t);
            }
        });
    }

    public static void loadInterstitialAds(Activity activity) {
        if (activity != null) {
            currentActivity = activity;
        }
        runOnMain(() -> {
            if (!consented) {
                Log.d(TAG, "Skip interstitial load: privacy consent not granted");
                return;
            }
            if (!initialized && !TTAdSdk.isInitSuccess()) {
                initializeIfConsented(appContext, true);
                return;
            }
            if (loading || hasUsableCachedAd()) {
                return;
            }
            Context context = currentActivity != null ? currentActivity : appContext;
            if (context == null) {
                Log.w(TAG, "Skip interstitial load: context is null");
                return;
            }

            loading = true;
            AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(INTERSTITIAL_CODE_ID)
                .setOrientation(TTAdConstant.VERTICAL)
                .setImageAcceptedSize(1080, 1920)
                .setAdCount(1)
                .setAdLoadType(TTAdLoadType.LOAD)
                .build();

            try {
                TTAdNative adNative = TTAdSdk.getAdManager().createAdNative(context);
                adNative.loadFullScreenVideoAd(adSlot, new TTAdNative.FullScreenVideoAdListener() {
                    @Override
                    public void onError(int code, String message) {
                        loading = false;
                        Log.w(TAG, "Pangle interstitial load failed: " + code + ", " + message);
                    }

                    @Override
                    public void onFullScreenVideoAdLoad(TTFullScreenVideoAd ad) {
                        cacheAd(ad);
                        Log.d(TAG, "Pangle interstitial loaded");
                    }

                    @Override
                    public void onFullScreenVideoCached() {
                        loading = false;
                        Log.d(TAG, "Pangle interstitial cached");
                    }

                    @Override
                    public void onFullScreenVideoCached(TTFullScreenVideoAd ad) {
                        cacheAd(ad);
                        Log.d(TAG, "Pangle interstitial cached with ad");
                    }
                });
            } catch (Throwable t) {
                loading = false;
                Log.e(TAG, "Pangle interstitial load error", t);
            }
        });
    }

    public static boolean participateInAuction(Activity activity) {
        if (activity != null) {
            currentActivity = activity;
        }
        if (!consented) {
            Log.d(TAG, "Skip interstitial show: privacy consent not granted");
            return false;
        }
        if (currentActivity == null) {
            loadInterstitialAds(activity);
            return false;
        }
        long now = System.currentTimeMillis();
        if (now - lastShowTime < SHOW_INTERVAL_MS) {
            Log.d(TAG, "Skip interstitial show: cooldown");
            return false;
        }
        if (!hasUsableCachedAd()) {
            loadInterstitialAds(currentActivity);
            return false;
        }
        TTFullScreenVideoAd ad = cachedInterstitialAd;
        clearAd();
        showing = true;
        lastShowTime = now;
        runOnMain(() -> {
            try {
                ad.showFullScreenVideoAd(currentActivity);
            } catch (Throwable t) {
                showing = false;
                Log.e(TAG, "Pangle interstitial show error", t);
                loadInterstitialAds(currentActivity);
            }
        });
        return true;
    }

    private static void cacheAd(TTFullScreenVideoAd ad) {
        loading = false;
        cachedInterstitialAd = ad;
        cachedAt = System.currentTimeMillis();
        if (ad == null) {
            return;
        }
        ad.setFullScreenVideoAdInteractionListener(new TTFullScreenVideoAd.FullScreenVideoAdInteractionListener() {
            @Override
            public void onAdShow() {
                Log.d(TAG, "Pangle interstitial shown");
            }

            @Override
            public void onAdVideoBarClick() {
                Log.d(TAG, "Pangle interstitial clicked");
            }

            @Override
            public void onAdClose() {
                showing = false;
                Log.d(TAG, "Pangle interstitial closed");
                loadInterstitialAds(currentActivity);
            }

            @Override
            public void onVideoComplete() {
                Log.d(TAG, "Pangle interstitial completed");
            }

            @Override
            public void onSkippedVideo() {
                Log.d(TAG, "Pangle interstitial skipped");
            }
        });
    }

    private static boolean hasUsableCachedAd() {
        if (cachedInterstitialAd == null || showing) {
            return false;
        }
        long now = System.currentTimeMillis();
        long sdkExpireAt = cachedInterstitialAd.getExpirationTimestamp();
        if (sdkExpireAt > 0 && now >= sdkExpireAt - AD_EXPIRE_SAFETY_MS) {
            clearAd();
            return false;
        }
        if (cachedAt > 0 && now - cachedAt > 30 * 60_000L) {
            clearAd();
            return false;
        }
        return true;
    }

    private static void clearAd() {
        cachedInterstitialAd = null;
        cachedAt = 0L;
        loading = false;
        showing = false;
    }

    private static void runOnMain(Runnable runnable) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            runnable.run();
        } else {
            MAIN.post(runnable);
        }
    }

    private static boolean isDebuggable(Context context) {
        return context != null
            && (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }
}
