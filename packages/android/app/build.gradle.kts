import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

buildscript {
    repositories {
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
    dependencies {
        classpath(libs.json.schema.validator)
    }
}

android {
    namespace = "com.thewall.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.thewall.android"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.accompanist.drawablepainter)
    implementation(libs.gson)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.work.runtime.ktx)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)

    // JSON schema validator for build-time validation
    implementation(libs.org.json)
}

// ----------------------------------------------------------------------------------
// --- WARNING: SYNC BREADCRUMB -----------------------------------------------------
// ----------------------------------------------------------------------------------
// This task copies the master JSON database from the `scrapper` package.
// If the location or filename in the scrapper package changes, this task MUST be updated.
// This is the source of truth for the URL Lookup feature.
//
tasks.register("copyAllJson") {
    val sourceFile = file("${project.rootProject.projectDir}/../scrapper/results/4_final/ALL.json")
    val destFile = file("src/main/assets/ALL.json")

    doLast {
        if (!sourceFile.exists()) {
            throw GradleException("ALL.json not found at ${sourceFile.absolutePath}.")
        }
        destFile.parentFile.mkdirs()
        sourceFile.copyTo(destFile, overwrite = true)
        println("✅ Copied ALL.json to ${destFile.absolutePath}")
    }
}


// Task to copy schema from common package to Android assets
tasks.register("copyBlacklistSchema") {
    val schemaSource = file("${project.rootProject.projectDir}/../common/src/schemas/blacklist.schema.json")
    val schemaDest = file("src/main/assets/blacklist.schema.json")

    doLast {
        if (!schemaSource.exists()) {
            throw GradleException("Schema file not found at ${schemaSource.absolutePath}. Run 'pnpm run generate-schema' in common package first.")
        }
        schemaDest.parentFile.mkdirs()
        schemaSource.copyTo(schemaDest, overwrite = true)
        println("✅ Copied blacklist schema to ${schemaDest.absolutePath}")
    }
}

// Task to validate blacklist.json against schema at build time
tasks.register("validateBlacklist") {
    dependsOn("copyBlacklistSchema")

    val blacklistFile = file("src/main/assets/blacklist.json")
    val schemaFile = file("src/main/assets/blacklist.schema.json")

    doLast {
        if (!blacklistFile.exists()) {
            throw GradleException("blacklist.json not found at ${blacklistFile.absolutePath}")
        }
        if (!schemaFile.exists()) {
            throw GradleException("blacklist.schema.json not found at ${schemaFile.absolutePath}. Run 'copyBlacklistSchema' task first.")
        }

        try {
            val schemaText = schemaFile.readText()
            val blacklistText = blacklistFile.readText()

            // Schema is a JSON object (even though it describes an array)
            val schemaJson = org.json.JSONObject(schemaText)
            val blacklistJson = org.json.JSONArray(blacklistText)

            val schema = org.everit.json.schema.loader.SchemaLoader.load(schemaJson)
            schema.validate(blacklistJson)
            println("✅ blacklist.json validation passed - schema matches models.kt structure")
        } catch (e: org.everit.json.schema.ValidationException) {
            val errors = e.causingExceptions.ifEmpty { listOf(e) }
            errors.forEach { error ->
                println("❌ Validation error: ${error.message}")
                println("   Violated schema: ${error.schemaLocation}")
                println("   Instance location: ${error.pointerToViolation}")
            }
            throw GradleException("blacklist.json validation failed. See errors above.")
        } catch (e: Exception) {
            throw GradleException("Failed to validate blacklist.json: ${e.message}", e)
        }
    }
}

// Make validation run before compilation
tasks.named("preBuild") {
    dependsOn("validateBlacklist")
    dependsOn("copyAllJson")
}

tasks.register("preCommitCheck") {
    dependsOn("lintDebug", "validateBlacklist")
    doLast {
        println("✅ Pre-commit checks passed!")
    }
}
