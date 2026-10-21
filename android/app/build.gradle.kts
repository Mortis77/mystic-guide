plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ai.mysticguide"
    compileSdk = 34

    defaultConfig {
        applicationId = "ai.mysticguide"
        minSdk = 24
        targetSdk = 34
        versionCode = 10716
        versionName = "0.23.0"
    }

    signingConfigs {
        create("release") {
            // 密钥放在仓库外（.data/keys，已 gitignore）。
            // 换机器时把 witch-notebook.jks 放回同一位置即可，签名必须一脉相承，
            // 否则老用户装不上新版（签名冲突）。
            val ksPath = rootProject.file("../.data/keys/witch-notebook.jks")
            if (ksPath.exists()) {
                storeFile = ksPath
                storePassword = "witchnotebook"
                keyAlias = "witch"
                keyPassword = "witchnotebook"
            }
        }
    }

    buildTypes {
        debug {
            // debug 也用同一把钥匙，避免"模拟器包"和"真机包"互装不上
            val ksPath = rootProject.file("../.data/keys/witch-notebook.jks")
            if (ksPath.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        release {
            isMinifyEnabled = false
            val ksPath = rootProject.file("../.data/keys/witch-notebook.jks")
            if (ksPath.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.core:core-ktx:1.13.1")
}
