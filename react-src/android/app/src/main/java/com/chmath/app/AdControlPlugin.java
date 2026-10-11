package com.chmath.app;

import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AdControl")
public class AdControlPlugin extends Plugin {

    @PluginMethod
    public void openAppMarket(PluginCall call) {
        String pkg = call.getString("pkgName");
        if (pkg == null || pkg.isEmpty()) {
            call.reject("pkgName required");
            return;
        }
        runOnMainThread(() -> {
            Activity activity = getActivity();
            if (activity == null && getBridge() != null) {
                activity = getBridge().getActivity();
            }
            if (activity == null) {
                call.reject("No activity available");
                return;
            }
            try {
                // 1. 针对华为设备，直接调起华为应用市场专属应用详情页面
                Intent huaweiIntent = new Intent("com.huawei.appmarket.intent.action.AppDetail");
                huaweiIntent.setPackage("com.huawei.appmarket");
                huaweiIntent.putExtra("APP_PACKAGENAME", pkg);
                huaweiIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(huaweiIntent);
                call.resolve();
            } catch (Throwable t1) {
                try {
                    // 2. 备用方式：通用 market:// 协议
                    Intent marketIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("market://details?id=" + pkg));
                    marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(marketIntent);
                    call.resolve();
                } catch (Throwable t2) {
                    call.reject("Failed to open market: " + t2.getMessage());
                }
            }
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        runOnMainThread(() -> {
            Activity activity = getActivity();
            if (activity == null && getBridge() != null) {
                activity = getBridge().getActivity();
            }
            boolean shown = AdManager.participateInAuction(activity);
            JSObject ret = new JSObject();
            ret.put("status", shown ? "shown" : "not_ready");
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void setConsent(PluginCall call) {
        android.util.Log.e("AdControl", "========== setConsent CALLED ==========");
        boolean consent = call.getBoolean("consent", true);
        android.util.Log.e("AdControl", "setConsent received consent value: " + consent);
        try {
            Context ctx = getContext();
            if (ctx == null) {
                android.util.Log.e("AdControl", "setConsent ERROR: No context available");
                call.reject("No context available");
                return;
            }
            android.util.Log.e("AdControl", "setConsent: Context obtained, writing preferences...");
            // 写入原生偏好 - 使用commit确保立即写入
            SharedPreferences sp = ctx.getSharedPreferences("privacy_prefs", Context.MODE_PRIVATE);
            boolean write1 = sp.edit().putBoolean("consent", consent).commit();
            android.util.Log.e("AdControl", "setConsent: privacy_prefs write result: " + write1);
            // 兼容 Capacitor Storage（供前端读取）- 使用commit确保立即写入
            SharedPreferences cap = ctx.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            boolean write2 = cap.edit()
               .putString("privacy_accepted", consent ? "true" : "false")
               .putString("privacyAccepted", consent ? "true" : "false")
               .putString("privacy_accept", consent ? "true" : "false")
               .putString("USER_PRIVACY_ACCEPTED", consent ? "true" : "false")
               .commit();
            android.util.Log.e("AdControl", "setConsent: CapacitorStorage write result: " + write2);

            android.util.Log.e("AdControl", "setConsent write => native=" + consent + 
                ", webKeys=[privacy_accepted, privacyAccepted, privacy_accept, USER_PRIVACY_ACCEPTED]");

            if (consent) {
                android.util.Log.e("AdControl", "setConsent: User consented, initializing ads");
                Context appCtx = ctx.getApplicationContext();
                runOnMainThread(() -> {
                    try {
                        Activity activity = getActivity();
                        if (activity == null && getBridge() != null) {
                            activity = getBridge().getActivity();
                        }
                        AdManager.initializeIfConsented(appCtx, true);
                        AdManager.loadInterstitialAds(activity);
                        // 通知 MainActivity 有新的同意状态可用
                        Intent it = new Intent(MainActivity.ACTION_CONSENT_UPDATED);
                        appCtx.sendBroadcast(it);
                    } catch (Throwable ignored) {}
                });
            } else {
                // 用户未同意，退出应用
                android.util.Log.d("AdControl", "User declined consent, exiting app");
                runOnMainThread(() -> {
                    Activity activity = getActivity();
                    if (activity == null && getBridge() != null) {
                        activity = getBridge().getActivity();
                    }
                    if (activity != null) {
                        activity.finishAffinity(); // 关闭 Activity
                        System.exit(0); // 彻底杀掉进程
                    } else {
                        System.exit(0);
                    }
                });
            }

            JSObject ret = new JSObject();
            ret.put("status", "ok");
            ret.put("consent", consent);
            call.resolve(ret);
        } catch (Throwable t) {
            call.reject("setConsent failed: " + t.getMessage());
        }
    }


    private void runOnMainThread(Runnable runnable) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(runnable);
        } else {
            new Handler(Looper.getMainLooper()).post(runnable);
        }
    }
}
