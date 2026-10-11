package com.chmath.app;

import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;
import java.util.Locale;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "VoiceRecognition",
    permissions = { @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "record_audio") },
    requestCodes = { 9001 }
)
public class VoiceRecognitionPlugin extends Plugin implements RecognitionListener {

    private static final int REQUEST_VOICE_INTENT = 9001;
    private static final float SAMPLE_RATE = 16000.0f;

    private SpeechRecognizer speechRecognizer;
    private Model voskModel;
    private SpeechService voskSpeechService;
    private boolean voskInitialized = false;
    private boolean voskInitInProgress = false;
    private PluginCall currentCall;
    private volatile boolean voskResultReceived = false;
    private boolean emitPartialResults = false;
    private String lastNonEmptyResult = ""; // 用于缓存最近一次非空识别结果，防止 onFinalResult 为空
    private String lastPartialResult = ""; // 兜底缓存 partial，松手时可直接回填

    private String pickBestCachedResult() {
        String nonEmpty = lastNonEmptyResult == null ? "" : lastNonEmptyResult.trim();
        String partial = lastPartialResult == null ? "" : lastPartialResult.trim();
        if (nonEmpty.isEmpty()) return partial;
        if (partial.isEmpty()) return nonEmpty;

        // partial 往往更新更晚，优先取去空格后更长的那个，避免“一万零三十”被截成“一万”
        int nonEmptyLen = nonEmpty.replaceAll("\\s+", "").length();
        int partialLen = partial.replaceAll("\\s+", "").length();
        return partialLen > nonEmptyLen ? partial : nonEmpty;
    }

    private String sanitizeRecognizedText(String text) {
        if (text == null) return "";
        String sanitized = text
            .replaceAll("(?i)\\[unk\\]", " ")
            .replaceAll("(?i)<unk>", " ")
            .replaceAll("(?i)\\bunk\\b", " ")
            .replaceAll("\\s+", " ")
            .trim();
        return sanitized;
    }

    private void stopVoskServiceInternal(boolean shutdown) {
        if (voskSpeechService != null) {
            try {
                voskSpeechService.stop();
                if (shutdown) {
                    voskSpeechService.shutdown();
                }
            } catch (Exception e) {
                android.util.Log.w("VoiceRecognition", "Vosk stop failed", e);
            }
            if (shutdown) {
                voskSpeechService = null;
            }
        }
    }

    private boolean isRecordAudioGranted() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void available(PluginCall call) {
        boolean available = isRecognitionAvailable();
        JSObject result = new JSObject();
        result.put("available", available);
        call.resolve(result);
    }

    private boolean isRecognitionAvailable() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return SpeechRecognizer.isRecognitionAvailable(getContext());
        }
        try {
            SpeechRecognizer.createSpeechRecognizer(getContext());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean hasIntentHandler() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.CHINESE);
        return getContext().getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null;
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", isRecordAudioGranted());
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (isRecordAudioGranted()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("record_audio", call, "recordPermissionCallback");
    }

    @PermissionCallback
    private void recordPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", isRecordAudioGranted());
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        lastNonEmptyResult = "";
        lastPartialResult = "";
        android.util.Log.d("VoiceRecognition", "start方法被调用");
        // Capacitor 6 会在方法返回后自动释放 PluginCall，
        // 必须 setKeepAlive(true) 以确保异步回调时仍可 resolve
        call.setKeepAlive(true);
        currentCall = call;
        emitPartialResults = call.getBoolean("partialResults", false);

        if (!isRecordAudioGranted()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "需要录音权限");
            call.setKeepAlive(false);
            call.resolve(result);
            return;
        }

        voskResultReceived = false;
        tryStartVosk(call);
    }

    private void tryStartVosk(final PluginCall call) {
        if (voskInitialized && voskModel != null) {
            startVoskListening();
            return;
        }
        
        if (voskInitInProgress) {
            // Already initializing, let the listener handle the start when done
            android.util.Log.d("VoiceRecognition", "Vosk init in progress, waiting...");
            return;
        }
        
        voskInitInProgress = true;
        android.util.Log.d("VoiceRecognition", "Starting Vosk model unpacking...");
        
        StorageService.unpack(getContext(), "model-cn", "model",
            (model) -> {
                voskModel = model;
                voskInitialized = true;
                voskInitInProgress = false;
                android.util.Log.d("VoiceRecognition", "Vosk 中文模型加载完成");
                startVoskListening();
            },
            (exception) -> {
                android.util.Log.e("VoiceRecognition", "Vosk 模型加载失败", exception);
                voskInitInProgress = false;
                fallbackToSystemRecognition(call);
            });
    }

    private void startVoskListening() {
        if (voskModel == null || currentCall == null) return;
        try {
            stopVoskServiceInternal(true);
            
            // User suggestion: Restrict grammar to math terms drastically improves accuracy for calculator
            String grammar = "[\"零\", \"一\", \"二\", \"两\", \"三\", \"四\", \"五\", \"六\", \"七\", \"八\", \"九\", " +
                             "\"十\", \"百\", \"千\", \"万\", \"亿\", \"点\", " +
                             "\"加\", \"加上\", \"减\", \"减去\", \"乘\", \"乘以\", \"除\", \"除以\", " +
                             "\"等于\", \"等\", \"几\", \"多少\", \"计算\", \"得\", \"[unk]\"]";
                             
            Recognizer recognizer = new Recognizer(voskModel, SAMPLE_RATE, grammar);
            voskSpeechService = new SpeechService(recognizer, SAMPLE_RATE);
            voskSpeechService.startListening(this);
            android.util.Log.d("VoiceRecognition", "Vosk 开始监听 (带有限语法)");
        } catch (Exception e) {
            android.util.Log.e("VoiceRecognition", "Vosk startListening 失败", e);
            fallbackToSystemRecognition(currentCall);
        }
    }

    private void fallbackToSystemRecognition(final PluginCall call) {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                doSystemRecognition(call);
            }
        });
    }

    @Override
    public void onResult(String hypothesis) {
        android.util.Log.d("VoiceRecognition", "Vosk onResult received");
        String text = parseVoskResult(hypothesis);
        if (text != null && !text.trim().isEmpty()) {
            lastNonEmptyResult = text;
        }
    }

    @Override
    public void onFinalResult(String hypothesis) {
        if (voskResultReceived || currentCall == null) return;
        voskResultReceived = true;
        android.util.Log.d("VoiceRecognition", "Vosk onFinalResult received");
        PluginCall call = currentCall;
        stopVoskServiceInternal(true);
        currentCall = null;
        String text = parseVoskResult(hypothesis);
        String bestCached = pickBestCachedResult();
        if (text == null || text.trim().isEmpty()) {
            if (!bestCached.isEmpty()) {
                android.util.Log.d("VoiceRecognition", "onFinalResult empty, restored best cached result");
                text = bestCached;
            }
        } else if (!bestCached.isEmpty()) {
            int currentLen = text.replaceAll("\\s+", "").length();
            int cachedLen = bestCached.replaceAll("\\s+", "").length();
            if (cachedLen > currentLen) {
                android.util.Log.d("VoiceRecognition", "onFinalResult shorter than cached, using cached result");
                text = bestCached;
            }
        }
        
        if (text == null || text.trim().isEmpty()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "未识别到语音");
            call.setKeepAlive(false);
            call.resolve(result);
            return;
        }
        String processed = processMathKeywords(text);
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("text", text);
        result.put("processed", processed);
        call.setKeepAlive(false);
        call.resolve(result);
    }

    private String parseVoskResult(String json) {
        if (json == null) return "";
        String raw = json.trim();
        if (raw.isEmpty()) return "";
        try {
            JSONObject obj = new JSONObject(raw);
            String text = obj.optString("text", "").trim();
            if (!text.isEmpty()) {
                return sanitizeRecognizedText(text);
            }
            String partial = obj.optString("partial", "").trim();
            if (!partial.isEmpty()) {
                return sanitizeRecognizedText(partial);
            }
            JSONArray words = obj.optJSONArray("result");
            if (words != null && words.length() > 0) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < words.length(); i++) {
                    JSONObject item = words.optJSONObject(i);
                    if (item == null) continue;
                    String word = item.optString("word", "").trim();
                    if (word.isEmpty()) continue;
                    if (sb.length() > 0) sb.append(' ');
                    sb.append(word);
                }
                return sanitizeRecognizedText(sb.toString().trim());
            }
            // JSON 结构但没有可用文本，返回空串，避免把 {"text":""} 当作识别文本
            return "";
        } catch (Exception e) {
            // 不是 JSON 时，可能是纯文本，直接返回原始字符串
            android.util.Log.w("VoiceRecognition", "parseVoskResult failed", e);
        }
        return sanitizeRecognizedText(raw);
    }

    @Override
    public void onPartialResult(String hypothesis) {
        android.util.Log.d("VoiceRecognition", "Vosk partial result received");
        if (emitPartialResults && hypothesis != null && !hypothesis.isEmpty()) {
            String text = parseVoskResult(hypothesis);
            if (text != null && !text.trim().isEmpty()) {
                lastPartialResult = text;
                String processed = processMathKeywords(text);
                JSObject data = new JSObject();
                data.put("transcript", text);
                data.put("processed", processed);
                notifyListeners("partialResult", data);
            }
        }
    }

    @Override
    public void onError(Exception e) {
        android.util.Log.e("VoiceRecognition", "Vosk error", e);
        if (currentCall != null && !voskResultReceived) {
            voskResultReceived = true;
            PluginCall call = currentCall;
            stopVoskServiceInternal(true);
            currentCall = null;
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", e != null ? e.getMessage() : "语音识别失败");
            call.setKeepAlive(false);
            call.resolve(result);
        }
    }

    @Override
    public void onTimeout() {
        android.util.Log.d("VoiceRecognition", "Vosk timeout");
        if (currentCall != null && !voskResultReceived) {
            voskResultReceived = true;
            PluginCall call = currentCall;
            stopVoskServiceInternal(true);
            currentCall = null;
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "识别超时");
            call.setKeepAlive(false);
            call.resolve(result);
        }
    }

    private void doSystemRecognition(PluginCall call) {
        if (!isRecognitionAvailable() && hasIntentHandler()) {
            startVoiceIntent(call);
            return;
        }
        if (!isRecognitionAvailable()) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "本设备暂不支持语音识别，请使用键盘输入");
            call.setKeepAlive(false);
            call.resolve(result);
            return;
        }
        if (speechRecognizer == null) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            speechRecognizer.setRecognitionListener(new android.speech.RecognitionListener() {
                @Override
                public void onReadyForSpeech(android.os.Bundle params) {}
                @Override
                public void onBeginningOfSpeech() {}
                @Override
                public void onRmsChanged(float rmsdB) {}
                @Override
                public void onBufferReceived(byte[] buffer) {}
                @Override
                public void onEndOfSpeech() {}
                @Override
                public void onError(int error) {
                    JSObject result = new JSObject();
                    result.put("success", false);
                    result.put("error", "语音识别失败");
                    if (currentCall != null) {
                        currentCall.setKeepAlive(false);
                        currentCall.resolve(result);
                        currentCall = null;
                    }
                }
                @Override
                public void onResults(android.os.Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        String text = matches.get(0);
                        String processed = processMathKeywords(text);
                        JSObject result = new JSObject();
                        result.put("success", true);
                        result.put("text", text);
                        result.put("processed", processed);
                        if (currentCall != null) {
                            currentCall.setKeepAlive(false);
                            currentCall.resolve(result);
                            currentCall = null;
                        }
                    } else {
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("error", "未识别到语音");
                        if (currentCall != null) {
                            currentCall.setKeepAlive(false);
                            currentCall.resolve(result);
                            currentCall = null;
                        }
                    }
                }
                @Override
                public void onPartialResults(android.os.Bundle partialResults) {}
                @Override
                public void onEvent(int eventType, android.os.Bundle params) {}
            });
        }
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.CHINESE);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "请说出数学运算");
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        speechRecognizer.startListening(intent);
    }

    private void startVoiceIntent(PluginCall call) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.CHINESE);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "请说出数学运算");
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        try {
            startActivityForResult(call, intent, REQUEST_VOICE_INTENT);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "无法打开语音输入");
            call.setKeepAlive(false);
            call.resolve(result);
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_VOICE_INTENT) return;
        PluginCall call = getSavedCall();
        if (call == null) return;
        if (resultCode == android.app.Activity.RESULT_OK && data != null) {
            ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (matches != null && !matches.isEmpty()) {
                String text = matches.get(0);
                String processed = processMathKeywords(text);
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("text", text);
                result.put("processed", processed);
                call.resolve(result);
                return;
            }
        }
        JSObject result = new JSObject();
        result.put("success", false);
        result.put("error", "未识别到语音");
        call.resolve(result);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (voskSpeechService != null) {
            // 对 Vosk 先发 stop，让其有机会回调 final result
            try {
                voskSpeechService.stop();
            } catch (Exception e) {
                android.util.Log.w("VoiceRecognition", "Vosk stop request failed", e);
            }
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (currentCall != null && !voskResultReceived) {
                        voskResultReceived = true;
                        PluginCall pendingCall = currentCall;
                        stopVoskServiceInternal(true);
                        currentCall = null;
                        JSObject result = new JSObject();
                        String fallbackText = pickBestCachedResult();

                        if (fallbackText != null && !fallbackText.trim().isEmpty()) {
                            result.put("success", true);
                            result.put("text", fallbackText);
                            result.put("processed", processMathKeywords(fallbackText));
                        } else {
                            result.put("success", false);
                            result.put("error", "未识别到语音");
                        }
                        pendingCall.setKeepAlive(false);
                        pendingCall.resolve(result);
                    }
                }
            }, 1200);
        } else if (currentCall != null && !voskResultReceived) {
            voskResultReceived = true;
            JSObject result = new JSObject();
            String fallbackText = pickBestCachedResult();

            if (fallbackText != null && !fallbackText.trim().isEmpty()) {
                result.put("success", true);
                result.put("text", fallbackText);
                result.put("processed", processMathKeywords(fallbackText));
            } else {
                result.put("success", false);
                result.put("error", "已取消听取");
            }
            currentCall.resolve(result);
            currentCall = null;
        }
        
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
        }

        call.resolve();
    }

    private String processMathKeywords(String text) {
        if (text == null) return "";
        String t = text.trim();
        // 只做运算符与意图词归一，数字归一交给前端 voiceUtils 统一处理，
        // 避免出现“零三十 -> 0310”“一万零三十 -> 1万030”这类错误。
        t = t.replace("乘以", "*").replace("除以", "/")
            .replace("等于多少", "=").replace("等于几", "=")
            .replace("是多少", "=").replace("是几", "=")
            .replace("等于", "=").replace("计算", "=").replace("多少", "=")
            .replace("加", "+").replace("减", "-").replace("乘", "*").replace("除", "/")
            .replace("点", ".");
        return t.replaceAll("\\s+", "");
    }
}
