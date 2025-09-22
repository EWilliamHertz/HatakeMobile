# HatakeSocial Mobile App - Build Instructions

## 🎉 Ready to Build!

This project now has all the fixes applied for the Gradle build issues. You can build the Android APK successfully.

## 🚀 Quick Build (Recommended)

```bash
# Clone the project
git clone https://github.com/EWilliamHertz/HatakeMobile.git GeminiHatakeMobile
cd GeminiHatakeMobile

# Install dependencies
npm install --ignore-scripts

# Run the build script
./build-android.sh
```

## 📋 Manual Build Steps

If you prefer to build manually:

```bash
# 1. Set Java 11 environment
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 2. Navigate to android directory
cd android

# 3. Build the APK
./gradlew assembleRelease --no-daemon --max-workers=1
```

## ✅ What's Been Fixed

- ✅ **Removed deprecated MaxPermSize** from gradle.properties
- ✅ **Updated Gradle to version 7.6** for better compatibility
- ✅ **Fixed gradlew script** with proper JVM options
- ✅ **Downloaded correct gradle-wrapper.jar**
- ✅ **Set proper Java 11 environment**

## 📱 After Build Success

Your APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Upload to Storage Bucket:

```bash
# Upload APK
gcloud storage cp android/app/build/outputs/apk/release/app-release.apk gs://hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk

# Make it public
gcloud storage objects add-iam-policy-binding gs://hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk --member=allUsers --role=roles/storage.objectViewer
```

### Test Your App:

Your APK will be available at:
`https://storage.googleapis.com/hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk`

**Test on Appetize.io:**
1. Go to [appetize.io](https://appetize.io)
2. Click "Upload"
3. Enter your APK URL
4. Select Android platform
5. Test your HatakeSocial app!

## 🔧 Troubleshooting

### If Build Still Fails:

1. **Clean and retry:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease --no-daemon --max-workers=1
   ```

2. **Check Java version:**
   ```bash
   java -version
   # Should show OpenJDK 11
   ```

3. **Free up space:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install --production --no-optional
   ```

## 📦 What You'll Get

The built APK includes:
- **User-to-user messaging** (not AI chat)
- **Social feed** with posts and interactions
- **TCG collection management**
- **Marketplace** for card trading
- **Deck builder** functionality
- **Events and tournaments**
- **Firebase integration** with your existing backend

## 🎯 Expected Build Time

- **First build:** 15-20 minutes (downloads dependencies)
- **Subsequent builds:** 5-10 minutes

The build is now ready to work! 🚀
