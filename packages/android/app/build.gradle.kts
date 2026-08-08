import com.android.build.api.variant.AndroidComponentsExtension
import groovy.json.JsonSlurper
import org.gradle.api.DefaultTask
import org.gradle.api.file.RegularFileProperty
import org.gradle.api.provider.SetProperty
import org.gradle.api.tasks.CacheableTask
import org.gradle.api.tasks.InputFile
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.OutputFile
import org.gradle.api.tasks.PathSensitive
import org.gradle.api.tasks.PathSensitivity
import org.gradle.api.tasks.TaskAction
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.roborazzi)
    alias(libs.plugins.kotlin.serialization)
}

// Load version from version.properties
val versionPropsFile = rootProject.file("version.properties")
val versionProps = Properties().apply {
    if (versionPropsFile.exists()) {
        versionPropsFile.inputStream().use { load(it) }
    }
}
val appVersionCode = versionProps.getProperty("VERSION_CODE", "1").toInt()
val appVersionName = versionProps.getProperty("VERSION_NAME", "1.0.0")

// Load keystore properties (for release signing)
val keystorePropsFile = rootProject.file("keystore.properties")
val keystoreProps = Properties().apply {
    if (keystorePropsFile.exists()) {
        keystorePropsFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "com.thewallboycott.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.thewallboycott.android"
        minSdk = 24
        targetSdk = 36
        versionCode = appVersionCode
        versionName = appVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // Whitelist supported locales — only these languages are included from dependencies.
    // When adding a new language, you MUST add its code here.
    androidResources {
        localeFilters += setOf("en", "ar")
    }

    signingConfigs {
        // Release signing config - only create if keystore.properties exists
        if (keystorePropsFile.exists()) {
            create("release") {
                storeFile = file(keystoreProps.getProperty("storeFile", ""))
                storePassword = keystoreProps.getProperty("storePassword", "")
                keyAlias = keystoreProps.getProperty("keyAlias", "")
                keyPassword = keystoreProps.getProperty("keyPassword", "")
            }
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            isDebuggable = true
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Include native debug symbols for Play Console crash analysis
            ndk.debugSymbolLevel = "FULL"
            // Use release signing config if available
            if (keystorePropsFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    lint {
        // Strict linting - always abort on errors
        abortOnError = true
        // No baseline - fix all issues
        checkAllWarnings = true
        // Enforce translation completeness — build fails if any translatable string
        // is missing from a locale or if a locale has strings not in the default.
        // This applies to ALL current and future languages automatically.
        error += "MissingTranslation"
        error += "ExtraTranslation"
    }
    testOptions {
        unitTests {
            // Required for Robolectric to access Android resources
            isIncludeAndroidResources = true
            all {
                it.jvmArgs("-Xmx1g")
            }
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
        allWarningsAsErrors.set(true)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.fragment)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.accompanist.drawablepainter)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.play.billing)
    implementation(libs.lottie.compose)
    implementation(libs.androidx.splashscreen)

    // Unit tests (JVM-based, no emulator required)
    testImplementation(libs.junit)
    testImplementation(libs.robolectric)
    testImplementation(libs.roborazzi)
    testImplementation(libs.roborazzi.compose)
    testImplementation(libs.roborazzi.junit.rule)
    testImplementation(libs.androidx.work.testing)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(platform(libs.androidx.compose.bom))
    testImplementation(libs.androidx.ui.test.junit4)

    // Instrumented tests (requires device/emulator)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)

    // Debug-only (Compose tooling and test manifest)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

// ============================================================================
// Package visibility — generates a <queries> manifest from ALL.json so we can
// drop the QUERY_ALL_PACKAGES permission (Play Store policy compliance).
//
// Output: app/build/generated/queries/<variant>/AndroidManifest.xml
// Wired into manifest merge via androidComponents.onVariants below.
//
// Source-of-truth is the schema field `android_curated_app_ids` on each
// blocklist entry in ALL.json (defined in @theWallProject/common). Any entry
// that has `android_dev_id` but neither `android_app_ids` nor
// `android_curated_app_ids` will fail the build — Android <queries> only
// matches exact package names, never prefixes, so an orphaned dev-id silently
// makes that company's apps invisible to the on-device scanner.
//
// LIMITATION — curation completeness is NOT verified.
//   The orphan check below only catches entries that declare a dev_id with
//   zero concrete app IDs (a 100% blind entry). It cannot detect *incomplete*
//   curation: e.g. android_dev_id="com.wix" with curated=["com.wix.admin"] is
//   accepted, but if a real user has "com.wix.somenewapp" installed, the OS
//   will not surface it because <queries> has no prefix syntax. Pre-<queries>
//   the runtime prefix matcher (AppScanner.matchesPackage / ScanWorker)
//   would have caught it under QUERY_ALL_PACKAGES; under <queries> it cannot.
//
//   Mitigation: periodically audit curated_app_ids against the Play Store
//   listing for each developer namespace and update @theWallProject/scrapper
//   manual_resolve/manualOverrides.ts. There is no automated guard for this.
// ============================================================================

@CacheableTask
abstract class GenerateQueriesManifestTask : DefaultTask() {

    @get:InputFile
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val allJsonFile: RegularFileProperty

    @get:OutputFile
    abstract val outputManifest: RegularFileProperty

    @TaskAction
    fun generate() {
        val json = JsonSlurper().parse(allJsonFile.get().asFile) as List<*>

        val packages = sortedSetOf<String>()
        val orphanedDevIds = mutableListOf<String>()

        for (entry in json) {
            val item = entry as? Map<*, *> ?: continue

            val explicitAppIds = (item["android_app_ids"] as? List<*>)
                ?.mapNotNull { (it as? String)?.takeIf { s -> s.isValidPackage() } }
                ?: emptyList()
            packages.addAll(explicitAppIds)

            val curatedAppIds = (item["android_curated_app_ids"] as? List<*>)
                ?.mapNotNull { (it as? String)?.takeIf { s -> s.isValidPackage() } }
                ?: emptyList()
            packages.addAll(curatedAppIds)

            (item["hint_android_id"] as? String)?.takeIf { it.isValidPackage() }?.let(packages::add)

            val devId = item["android_dev_id"] as? String
            if (devId != null) {
                // The dev-id itself only matches if there's a literal package
                // with that exact name (rare, but harmless to declare).
                if (devId.isValidPackage()) {
                    packages.add(devId)
                }
                // Hard fail rule: if a company declares android_dev_id as the
                // only Android signal, the scanner can't see any of their apps
                // unless we enumerate them. This blocks silent regressions.
                if (explicitAppIds.isEmpty() && curatedAppIds.isEmpty()) {
                    val name = item["n"] as? String ?: item["id"] as? String ?: "<unknown>"
                    orphanedDevIds.add("$name (dev_id=$devId)")
                }
            }
        }

        if (orphanedDevIds.isNotEmpty()) {
            val message = buildString {
                append("Orphaned android_dev_id entries detected in ALL.json — these companies ")
                append("declare a developer prefix but no concrete app IDs, so the scanner ")
                append("cannot detect their apps under <queries>:\n\n")
                orphanedDevIds.sorted().forEach { append("  • ").append(it).append('\n') }
                append("\nFix: add `android_curated_app_ids: [...]` (or `android_app_ids: [...]`) ")
                append("to each entry in @theWallProject/scrapper, then run the scrapper to ")
                append("regenerate ALL.json. See packages/common/src/index.ts for schema.")
            }
            throw GradleException(message)
        }

        val xml = buildString {
            append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n")
            append("<!-- AUTO-GENERATED by :app:")
            append(name)
            append(" — DO NOT EDIT. Source: ALL.json -->\n")
            append("<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">\n")
            append("    <queries>\n")
            for (pkg in packages) {
                append("        <package android:name=\"")
                append(pkg)
                append("\" />\n")
            }
            append("    </queries>\n")
            append("</manifest>\n")
        }

        val outFile = outputManifest.get().asFile
        outFile.parentFile.mkdirs()
        outFile.writeText(xml)
        logger.lifecycle("Generated <queries> manifest with ${packages.size} packages → $outFile")
    }

    private fun String.isValidPackage(): Boolean {
        // Android package names: at least one dot, lowercase letters/digits/underscores
        // per segment, segments must start with a letter.
        if (!contains('.')) return false
        return split('.').all { seg ->
            seg.isNotEmpty() && seg[0].isLetter() && seg.all { c -> c.isLetterOrDigit() || c == '_' }
        }
    }
}

androidComponents {
    onVariants { variant ->
        val variantName = variant.name
        val capitalizedName = variantName.replaceFirstChar { it.uppercase() }
        val taskProvider = tasks.register<GenerateQueriesManifestTask>(
            "generate${capitalizedName}QueriesManifest"
        ) {
            allJsonFile.set(layout.projectDirectory.file("src/main/assets/ALL.json"))
            outputManifest.set(
                layout.buildDirectory.file("generated/queries/$variantName/AndroidManifest.xml")
            )
        }

        variant.sources.manifests.addGeneratedManifestFile(
            taskProvider = taskProvider,
            wiredWith = GenerateQueriesManifestTask::outputManifest
        )
    }
}
