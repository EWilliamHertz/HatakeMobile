# HatakeSocial Mobile

A React Native mobile application for the HatakeSocial platform - the ultimate TCG (Trading Card Game) social platform for Magic: The Gathering, Pokémon, and Yu-Gi-Oh! enthusiasts.

## Features

### 💬 User-to-User Messaging
- Real-time messaging between platform users
- Conversation history and management
- Message read status and notifications
- User avatars and online status

### 📱 Social Platform
- User profiles and authentication
- Social feed with posts, polls, and interactions
- Follow/unfollow system
- Like, comment, and share functionality
- Image and media sharing
- Community groups and discussions

### 🃏 TCG Collection Management
- Digital card collection tracking
- Collection statistics and value monitoring
- Wishlist functionality
- CSV import from Manabox and other apps
- Multi-game support (Magic, Pokémon, Yu-Gi-Oh!)

### 🏗️ Advanced Deck Builder
- Comprehensive deck building tool
- Access to up-to-date card databases
- Deck analytics and mana curve visualization
- Community deck sharing
- Import/export functionality

### 🛒 Marketplace & Trading
- Browse and search cards
- Create listings with images
- Secure trading system with escrow
- User reviews and ratings
- Multi-currency support (USD, SEK, EUR, GBP, NOK, DKK)

### 🏆 Events & Tournaments
- Tournament finder and calendar
- Local and online event discovery
- Event creation and management
- Filter by game, format, and location

### 🔧 Technical Features
- Firebase backend integration
- Offline support and caching
- Performance optimizations
- Dark theme UI
- Cross-platform compatibility (iOS & Android)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **CocoaPods** (for iOS dependencies): `sudo gem install cocoapods`

### Platform-Specific Requirements

#### Android
- Android SDK (API level 21 or higher)
- Android Virtual Device (AVD) or physical device
- Java Development Kit (JDK) 11

#### iOS
- macOS (required for iOS development)
- Xcode 12 or higher
- iOS Simulator or physical iOS device
- Apple Developer Account (for device deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EWilliamHertz/HatakeSocial-Mobile.git
   cd GeminiHatakeMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Firebase Configuration**
   
   The Firebase configuration files are already included:
   - `android/app/google-services.json` (Android)
   - `ios/GoogleService-Info.plist` (iOS)
   
   These connect to the existing HatakeSocial Firebase project.

## Development

### Running the App

#### Android
```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

#### iOS
```bash
# Start Metro bundler
npm start

# Run on iOS (in a new terminal)
npm run ios
```

### Development Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean project cache

## Project Structure

```
GeminiHatakeMobile/
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Firebase)
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── services/          # Firebase and API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── App.tsx                # Main app component
└── index.js              # App entry point
```

## Key Components

### Authentication
- **LoginScreen**: User login with email/password
- **RegisterScreen**: New user registration
- **ForgotPasswordScreen**: Password reset functionality

### Main Features
- **ChatScreen**: User-to-user messaging interface
- **FeedScreen**: Social media feed with posts and polls
- **MarketplaceScreen**: Card browsing and trading
- **ProfileScreen**: User profiles and collection stats
- **MyCollectionScreen**: Digital card collection management
- **DeckBuilderScreen**: Advanced deck building tool
- **EventsScreen**: Tournament and event calendar

### Navigation
- **RootNavigator**: Main navigation controller
- **AuthNavigator**: Authentication flow
- **MainNavigator**: Bottom tab navigation

## Firebase Integration

The app integrates with Firebase services:

- **Authentication**: User login and registration
- **Firestore**: Real-time database for posts, messages, collections, and user data
- **Cloud Functions**: Backend logic for marketplace, trading, and business logic
- **Storage**: File and image uploads

### Collections Structure

```
users/           # User profiles and settings
conversations/   # User-to-user conversations
messages/        # Chat messages between users
posts/          # Social media posts and polls
collections/    # User card collections
decks/          # User-created decks
marketplace/    # Card listings and trades
events/         # Tournament and event data
notifications/  # User notifications
```

## Building for Production

### Android

1. **Generate a signed APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **The APK will be located at:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### iOS

1. **Archive the app in Xcode**
   - Open `ios/GeminiHatakeMobile.xcworkspace` in Xcode
   - Select "Any iOS Device" as the target
   - Go to Product → Archive
   - Follow the distribution process

2. **Or use command line**
   ```bash
   cd ios
   xcodebuild -workspace GeminiHatakeMobile.xcworkspace \
              -scheme GeminiHatakeMobile \
              -configuration Release \
              -destination generic/platform=iOS \
              -archivePath GeminiHatakeMobile.xcarchive \
              archive
   ```

## Deployment

### Google Play Store (Android)

1. Create a Google Play Developer account
2. Generate a signed APK or AAB
3. Upload to Google Play Console
4. Complete store listing and publish

### Apple App Store (iOS)

1. Enroll in Apple Developer Program
2. Create App Store Connect record
3. Archive and upload via Xcode or Application Loader
4. Submit for review

## Online Testing Options

Since you're on an iPad and can't install Android development tools, here are online options to test the Android app:

### 1. **Expo Snack** (Recommended)
- Upload the project to [snack.expo.dev](https://snack.expo.dev)
- Test directly in browser or on your phone with Expo Go app
- Supports React Native components and basic Firebase integration

### 2. **CodeSandbox**
- Upload to [codesandbox.io](https://codesandbox.io)
- Limited React Native support but good for code review
- Can preview component structure and logic

### 3. **Appetize.io**
- Upload APK to [appetize.io](https://appetize.io)
- Run Android emulator in browser
- Requires building APK first (can be done on cloud services)

### 4. **BrowserStack App Live**
- Upload APK to [browserstack.com](https://www.browserstack.com/app-live)
- Test on real Android devices remotely
- Free trial available

### 5. **Firebase App Distribution**
- Upload APK to Firebase App Distribution
- Share with testers via email
- Test on real devices without app store

## Environment Configuration

### Development
- Debug builds connect to Firebase project
- Development logging enabled
- Hot reloading active

### Production
- Release builds with optimizations
- Production Firebase configuration
- Crash reporting enabled
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build errors**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

3. **iOS build errors**
   ```bash
   cd ios
   pod install --repo-update
   cd ..
   npm run ios
   ```

4. **Firebase connection issues**
   - Verify configuration files are in correct locations
   - Check Firebase project settings
   - Ensure bundle IDs match

### Performance Tips

- Use release builds for testing performance
- Enable Hermes engine for better performance
- Optimize images and reduce bundle size
- Use lazy loading for large lists

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Firebase authentication
- User-to-user messaging
- Social feed with posts and polls
- Card collection management
- Advanced deck builder
- Marketplace and trading
- Event calendar
- Cross-platform support
