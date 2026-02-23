# ============================================================
# ProGuard Rules for The Wall Android App
# ============================================================

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Hide original source file name in stack traces
-renamesourcefileattribute SourceFile

# ============================================================
# APP DATA MODELS
# Keep all data models for Gson serialization
# ============================================================

-keep class com.thewallboycott.android.data.models.** { *; }
-keepclassmembers class com.thewallboycott.android.data.models.** { *; }

# Keep Gson-serialized inner data classes outside data.models
# OfferPreferences$SavedOffer is serialized to SharedPreferences via Gson
-keep class com.thewallboycott.android.data.OfferPreferences$SavedOffer { *; }
-keepclassmembers class com.thewallboycott.android.data.OfferPreferences$SavedOffer { *; }

# NotificationPreferences$SnoozedApp is serialized to SharedPreferences via Gson
-keep class com.thewallboycott.android.data.NotificationPreferences$SnoozedApp { *; }
-keepclassmembers class com.thewallboycott.android.data.NotificationPreferences$SnoozedApp { *; }

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
# GSON
# ============================================================

# Gson uses generic type information stored in a class file when working with fields
-keepattributes Signature

# For using GSON @Expose annotation
-keepattributes *Annotation*

# Gson specific classes
-dontwarn sun.misc.**
-keep class com.google.gson.stream.** { *; }

# Prevent proguard from stripping interface information from TypeAdapter, TypeAdapterFactory,
# JsonSerializer, JsonDeserializer instances (so they can be used in @JsonAdapter)
-keep class * extends com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Prevent R8 from leaving Data object members always null
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Retain generic signatures of TypeToken and its subclasses with R8 version 3.0+
-keep,allowobfuscation,allowshrinking class com.google.gson.reflect.TypeToken
-keep,allowobfuscation,allowshrinking class * extends com.google.gson.reflect.TypeToken

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
