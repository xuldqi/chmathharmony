package com.chmath.app;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.analytics.MobclickAgent;

public class MainActivity extends BridgeActivity {
    public static final String ACTION_CONSENT_UPDATED = "com.chmath.app.ACTION_CONSENT_UPDATED";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 仅在调试包启用 WebView 调试，避免发布版暴露调试入口
        boolean debuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (debuggable && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true);
        }

        // Capacitor 6: 必须在 super.onCreate() 之前注册自定义插件，
        // 否则 Bridge 初始化时找不到插件，JS 端会报 "plugin is not implemented"
        registerPlugin(AdControlPlugin.class);
        registerPlugin(VoiceRecognitionPlugin.class);
        android.util.Log.d("MainActivity", "AdControlPlugin, VoiceRecognitionPlugin registered (before super.onCreate)");

        super.onCreate(savedInstanceState);
        
        android.util.Log.d("MainActivity", "MainActivity onCreate called");

        // 友盟预初始化（不采集设备信息，不上报）
        try {
            String appKey = null;
            String channel = null;
            try {
                ApplicationInfo ai = getPackageManager().getApplicationInfo(getPackageName(), PackageManager.GET_META_DATA);
                if (ai != null && ai.metaData != null) {
                    appKey = ai.metaData.getString("UMENG_APPKEY");
                    channel = ai.metaData.getString("UMENG_CHANNEL");
                }
            } catch (Throwable ignored) {}
            UMConfigure.preInit(getApplicationContext(), appKey, channel);
        } catch (Throwable t) {
            android.util.Log.w("MainActivity", "UMeng preInit failed", t);
        }
        
        if (hasPrivacyConsent()) {
            AdManager.setCurrentActivity(this);
            AdManager.initializeIfConsented(getApplicationContext(), true);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        android.util.Log.d("MainActivity", "onResume called");
        AdManager.setCurrentActivity(this);
        if (hasPrivacyConsent()) {
            AdManager.initializeIfConsented(getApplicationContext(), true);
            AdManager.loadInterstitialAds(this);
        }
    }

    @Override
    public void onDestroy() {
        try {
            MobclickAgent.onKillProcess(getApplicationContext());
        } catch (Throwable ignored) {}
        super.onDestroy();
    }

    private boolean hasPrivacyConsent() {
        try {
            SharedPreferences sp = getSharedPreferences("privacy_prefs", Context.MODE_PRIVATE);
            if (sp.getBoolean("consent", false)) {
                return true;
            }
            SharedPreferences cap = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            return "true".equals(cap.getString("privacy_accepted", "false"))
                || "true".equals(cap.getString("privacyAccepted", "false"))
                || "true".equals(cap.getString("privacy_accept", "false"))
                || "true".equals(cap.getString("USER_PRIVACY_ACCEPTED", "false"));
        } catch (Throwable ignored) {
            return false;
        }
    }
}
