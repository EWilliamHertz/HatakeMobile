/**
 * GeminiHatake Mobile App
 * React Native version of the GeminiHatake web application
 */

import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './src/contexts/AuthContext';
import {FirebaseProvider} from './src/contexts/FirebaseContext';
import RootNavigator from './src/navigation/RootNavigator';
import {theme} from './src/utils/theme';
import NetworkManager from './src/utils/network';
import StorageManager from './src/utils/storage';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Setting a timer',
    'AsyncStorage has been extracted',
    'Non-serializable values were found',
  ]);
}

const App: React.FC = () => {
  useEffect(() => {
    // Initialize app services
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize network monitoring
      NetworkManager.getCurrentState();
      
      // Clear expired cache on app start
      await StorageManager.clearCache();
      
      // Set up performance monitoring
      if (__DEV__) {
        console.log('GeminiHatake Mobile App initialized');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <FirebaseProvider>
          <AuthProvider>
            <NavigationContainer theme={theme}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.surface}
                translucent={false}
              />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </FirebaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
