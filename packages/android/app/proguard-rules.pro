# ============================================================
# ProGuard Rules for The Wall Android App
# ============================================================

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Hide original source file name in stack traces
-renamesourcefileattribute SourceFile

# ============================================================
# GOOGLE PLAY BILLING
# ============================================================

-keep class com.android.vending.billing.** { *; }
-keep class com.android.billingclient.api.** { *; }

# Keep billing-related classes
-keepclassmembers class * implements com.android.billingclient.api.PurchasesUpdatedListener {
    public <methods>;
}

# ============================================================
# JETPACK COMPOSE
# ============================================================

# Keep Compose runtime
-keep class androidx.compose.runtime.** { *; }

# Keep Compose UI
-keep class androidx.compose.ui.** { *; }

# Keep Compose intrinsics
-keepclassmembers class androidx.compose.ui.platform.** { *; }

# ============================================================
# ANDROIDX WORK MANAGER
# ============================================================

-keep class * extends androidx.work.Worker
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
-keep class androidx.work.WorkerParameters

# ============================================================
# KOTLIN
# ============================================================

# Keep Kotlin Metadata for reflection
-keepattributes RuntimeVisibleAnnotations

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}
-keepclassmembers class kotlin.coroutines.SafeContinuation {
    volatile <fields>;
}
-dontwarn kotlinx.coroutines.flow.**inlined**

# Keep Kotlin data classes
-keepclassmembers class * {
    public <init>(...);
}

# ============================================================
# NAVIGATION COMPOSE
# ============================================================

-keep class * extends androidx.navigation.Navigator

# ============================================================
# LOG STRIPPING (Release builds only)
# Remove verbose, debug, and info logs in release builds
# ============================================================

-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# ============================================================
# COMMON ANDROID RULES
# ============================================================

# Keep custom Application class
-keep class com.thewallboycott.android.** extends android.app.Application { *; }

# Keep Activities
-keep class * extends android.app.Activity

# Keep Services
-keep class * extends android.app.Service

# Keep BroadcastReceivers
-keep class * extends android.content.BroadcastReceiver

# Keep ContentProviders
-keep class * extends android.content.ContentProvider

# Preserve Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Preserve Serializable implementations
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ============================================================
# SUPPRESS WARNINGS
# ============================================================

-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
