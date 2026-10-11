plugins {
    id("com.android.application")
}

// The app opens the hosted site in a Trusted Web Activity: updates to the site reach the app without a new APK.
val siteHost = "resto-frigo.web.app"
val siteUrl = "https://$siteHost/"

android {
    namespace = "fr.restofrigo.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "fr.restofrigo.app"
        // Android 16 and later.
        minSdk = 36
        targetSdk = 36
        versionCode = (System.getenv("VERSION_CODE") ?: "1").toInt()
        versionName = "0.1.0"
        manifestPlaceholders["siteHost"] = siteHost
        manifestPlaceholders["siteUrl"] = siteUrl
        resValue("string", "asset_statements", """[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"web","site":"https://$siteHost"}}]""")
    }

    // Signed only when the keystore is provided (CI secrets); otherwise the release APK is built unsigned.
    val keystore = System.getenv("ANDROID_KEYSTORE_FILE")
    if (keystore != null) {
        signingConfigs {
            create("release") {
                storeFile = file(keystore)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "restofrigo"
                keyPassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (keystore != null) signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
