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

// Task to validate ALL.json against schema at build time
tasks.register("validateAllJson") {
    val allJsonFile = file("src/main/assets/ALL.json")
    val schemaFile = file("src/main/assets/all.generated.schema.json")

    doLast {
        if (!allJsonFile.exists()) {
            throw GradleException("ALL.json not found at ${allJsonFile.absolutePath}")
        }
        if (!schemaFile.exists()) {
            throw GradleException("all.generated.schema.json not found at ${schemaFile.absolutePath}. Run 'pnpm run generate-schema' in common package first.")
        }

        try {
            val schemaText = schemaFile.readText()
            val allJsonText = allJsonFile.readText()

            // Schema is a JSON object (even though it describes an array)
            val schemaJson = org.json.JSONObject(schemaText)
            val allJson = org.json.JSONArray(allJsonText)

            val schema = org.everit.json.schema.loader.SchemaLoader.load(schemaJson)
            schema.validate(allJson)
            println("✅ ALL.json validation passed - schema matches FinalDBFileSchema")
        } catch (e: org.everit.json.schema.ValidationException) {
            val errors = e.causingExceptions.ifEmpty { listOf(e) }
            errors.forEach { error ->
                println("❌ Validation error: ${error.message}")
                println("   Violated schema: ${error.schemaLocation}")
                println("   Instance location: ${error.pointerToViolation}")
            }
            throw GradleException("ALL.json validation failed. The file does not match the schema generated from FinalDBFileSchema. See errors above.")
        } catch (e: Exception) {
            throw GradleException("Failed to validate ALL.json: ${e.message}", e)
        }
    }
}

// Make validation run before compilation
tasks.named("preBuild") {
    dependsOn("validateAllJson")
}
