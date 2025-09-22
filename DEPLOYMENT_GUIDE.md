# HatakeSocial Mobile App - Deployment Guide

## Overview

This React Native application is the mobile version of the HatakeSocial platform - a comprehensive TCG (Trading Card Game) social platform for Magic: The Gathering, Pokémon, and Yu-Gi-Oh! enthusiasts.

## Features

### Core Features
- **User-to-User Messaging**: Direct messaging between platform users
- **Social Feed**: Posts, polls, images, likes, comments, and user interactions
- **My Collection**: Digital card collection management with statistics and CSV import
- **Deck Builder**: Advanced deck building tool with multiple TCG support
- **Marketplace**: Buy, sell, and trade cards with other users
- **Events**: Tournament and event calendar
- **Community**: Groups and discussions
- **Profile System**: User profiles with follow functionality

### Technical Features
- **Firebase Integration**: Authentication, Firestore, Cloud Functions, Storage
- **Offline Support**: Network detection and offline handling
- **Real-time Updates**: Live messaging and feed updates
- **Multi-currency Support**: USD, SEK, EUR, GBP, NOK, DKK
- **Dark Theme**: Consistent with web platform design
- **Native Performance**: Optimized for mobile devices

## Prerequisites

### Development Environment
- **Node.js**: 18.0 or higher
- **React Native CLI**: Latest version
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)
- **Java Development Kit (JDK)**: 11 or higher

### Firebase Configuration
- Firebase project with the following services enabled:
  - Authentication
  - Firestore Database
  - Cloud Functions
  - Storage
  - Hosting (for web version)

## Installation

### 1. Clone and Setup
```bash
cd GeminiHatakeMobile
npm install
```

### 2. Firebase Configuration
The Firebase configuration files are already included:
- `android/app/google-services.json` (Android)
- `ios/GoogleService-Info.plist` (iOS)

These files connect to your existing HatakeSocial Firebase project.

### 3. Install Dependencies
```bash
# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Install Android dependencies
npx react-native run-android --setup
```

## Development

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Debug Mode
```bash
# Enable debug mode
npm run debug

# View logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## Building for Production

### Android APK
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle (Recommended for Play Store)
```bash
cd android
./gradlew bundleRelease

# Bundle location: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Archive
```bash
# Open in Xcode
open ios/GeminiHatakeMobile.xcworkspace

# Or use command line
xcodebuild -workspace ios/GeminiHatakeMobile.xcworkspace \
           -scheme GeminiHatakeMobile \
           -configuration Release \
           -archivePath build/GeminiHatakeMobile.xcarchive \
           archive
```

## Firebase Backend Requirements

### Firestore Collections
The app expects these Firestore collections:
- `users` - User profiles and authentication data
- `conversations` - Chat conversations between users
- `messages` - Individual messages in conversations
- `posts` - Social feed posts
- `collections` - User card collections
- `decks` - User-created decks
- `marketplace` - Marketplace listings
- `events` - Tournament and event data

### Cloud Functions
Required Cloud Functions (should already exist in your Firebase project):
- User management functions
- Messaging functions
- Marketplace functions
- Collection management functions

### Security Rules
Ensure Firestore security rules allow:
- Users to read/write their own data
- Users to read public data (posts, marketplace, events)
- Users to participate in conversations they're part of

## App Store Deployment

### Google Play Store
1. Generate signed App Bundle: `./gradlew bundleRelease`
2. Upload to Google Play Console
3. Complete store listing with screenshots and descriptions
4. Submit for review

### Apple App Store
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Complete app information and screenshots
4. Submit for review

## Configuration

### Environment Variables
Create `.env` file in project root:
```
FIREBASE_PROJECT_ID=hatakesocial-88b5e
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=hatakesocial-88b5e.firebaseapp.com
FIREBASE_STORAGE_BUCKET=hatakesocial-88b5e.appspot.com
```

### App Configuration
Update `app.json` for your specific needs:
```json
{
  "name": "HatakeSocial",
  "displayName": "HatakeSocial",
  "version": "1.0.0",
  "versionCode": 1
}
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Troubleshooting

### Common Issues

#### Android Build Errors
- Ensure Java 11 is installed and JAVA_HOME is set
- Clean build: `cd android && ./gradlew clean`
- Check Android SDK path in `local.properties`

#### iOS Build Errors
- Run `pod install` in ios directory
- Clean build folder in Xcode
- Check iOS deployment target (minimum iOS 12.0)

#### Firebase Connection Issues
- Verify `google-services.json` and `GoogleService-Info.plist` are correct
- Check Firebase project configuration
- Ensure all required Firebase services are enabled

#### Metro Bundler Issues
- Clear cache: `npx react-native start --reset-cache`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Performance Optimization

### Bundle Size
- Use Hermes engine (enabled by default)
- Enable ProGuard for Android release builds
- Use vector icons instead of PNG images

### Runtime Performance
- Implement lazy loading for screens
- Use FlatList for large data sets
- Optimize image loading and caching

## Security Considerations

- All Firebase security rules should be properly configured
- User authentication is required for all sensitive operations
- API keys are properly secured in environment variables
- No sensitive data is stored in plain text

## Support and Maintenance

### Monitoring
- Set up Firebase Analytics for user behavior tracking
- Monitor crash reports through Firebase Crashlytics
- Track performance metrics

### Updates
- Regular dependency updates
- Firebase SDK updates
- React Native version updates

## Contact

For technical support or questions about the mobile app deployment, contact the development team.

---

**Note**: This mobile app is designed to work seamlessly with the existing HatakeSocial web platform and Firebase backend. Ensure all backend services are properly configured before deploying the mobile app.
