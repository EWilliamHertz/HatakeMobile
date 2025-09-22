#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting HatakeSocial Mobile App Build..."

# --- PRE-BUILD CLEANING AND SETUP ---
echo "🧹 Cleaning project, setting up environment, and installing dependencies..."

# Navigate to the project root directory
cd "$(dirname "$0")"

# --- The Definitive SDK & Gradle Fix ---
# 1. Set the ANDROID_HOME environment variable.
export ANDROID_HOME="/usr/lib/android-sdk"
echo "✅ ANDROID_HOME environment variable set to: $ANDROID_HOME"

# 2. Force-create the local.properties file.
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo "✅ android/local.properties file created/updated."

# 3. Remove the global gradle.properties file to prevent any conflicts.
rm -f ~/.gradle/gradle.properties
echo "✅ Removed global gradle.properties to ensure a clean state."

# 4. Forcefully stop any running Gradle Daemons to clear stale configurations.
echo "🛑 Stopping Gradle Daemon..."
cd android
./gradlew --stop
cd ..
echo "✅ Gradle Daemon stopped."
# --- End of Fix ---

# Deep clean the project
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -rf android/.gradle
rm -rf android/app/build

# Install dependencies using Yarn
yarn install

# --- ANDROID BUILD ---
echo "☕ Java and Node versions:"
java -version
node -v

echo "🔧 Building Android APK..."
echo "This will take 5-10 minutes..."

# Navigate to the android directory
cd android

# Run the Gradle command to build the release APK
./gradlew :app:assembleRelease

echo "✅ Build finished successfully!"
echo "You can find the APK in: ./android/app/build/outputs/apk/release/"

