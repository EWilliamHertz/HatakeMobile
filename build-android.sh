#!/bin/bash

# HatakeSocial Mobile App Build Script
# This script builds the Android APK with proper environment setup

echo "🚀 Starting HatakeSocial Mobile App Build..."

# Set Java 11 environment
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "☕ Java version:"
java -version

# Navigate to android directory
cd android

echo "🔧 Building Android APK..."
echo "This will take 10-15 minutes..."

# Build the release APK
./gradlew assembleRelease --no-daemon --max-workers=1

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ Build successful!"
    echo "📱 APK location: app/build/outputs/apk/release/app-release.apk"
    
    # Get APK size
    APK_SIZE=$(ls -lh app/build/outputs/apk/release/app-release.apk | awk '{print $5}')
    echo "📦 APK size: $APK_SIZE"
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Upload APK to storage bucket:"
    echo "   gcloud storage cp app/build/outputs/apk/release/app-release.apk gs://hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk"
    echo ""
    echo "2. Make it public:"
    echo "   gcloud storage objects add-iam-policy-binding gs://hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk --member=allUsers --role=roles/storage.objectViewer"
    echo ""
    echo "3. Test at: https://storage.googleapis.com/hatakesocial-88b5e-mobile/hatakesocial-mobile-app.apk"
    echo "4. Use Appetize.io to test the APK on your iPad"
    
else
    echo "❌ Build failed!"
    echo "Check the error messages above for details."
    exit 1
fi
