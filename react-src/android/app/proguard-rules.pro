# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# --- Keep Capacitor bridge and Plugins ---
-keep class com.getcapacitor.** { *; }
# --- Keep Capacitor bridge and Plugins ---
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.** class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.** *;
}
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses, SourceFile, LineNumberTable
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses


# --- Keep our specific native classes ---
-keep class com.chmath.app.AdControlPlugin { *; }
-keep class com.chmath.app.AdManager { *; }
-keep class com.chmath.app.VoiceRecognitionPlugin { *; }



# Pangle SDK keep (basic)
-keep class com.bytedance.sdk.** { *; }

# Keep Vosk and JNA classes for voice recognition
-keep class org.vosk.** { *; }
-keep class com.sun.jna.** { *; }
-keepclassmembers class * extends com.sun.jna.** { *; }

# Keep annotations and Parcelable/Serializable
-keepattributes *Annotation*
-keep class ** implements android.os.Parcelable { *; }
-keep class ** implements java.io.Serializable { *; }

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
