/**
 * Firebase Configuration for GeminiHatake Mobile
 * This file configures Firebase services for the React Native app
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';

// Firebase configuration
// Note: The actual config values should be added to google-services.json (Android) 
// and GoogleService-Info.plist (iOS) files
export const firebaseConfig = {
  // These values will be automatically loaded from the platform-specific config files
  // when you add your Firebase project configuration files
};

// Firebase service instances
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseFunctions = functions();
export const firebaseStorage = storage();

// Collection references
export const collections = {
  users: 'users',
  posts: 'posts',
  conversations: 'conversations',
  messages: 'messages',
  articles: 'articles',
  events: 'events',
  marketplace: 'marketplace',
  trades: 'trades',
  notifications: 'notifications',
};

// Cloud Functions
export const cloudFunctions = {
  // Chat and messaging functions
  sendMessage: firebaseFunctions.httpsCallable('sendMessage'),
  createConversation: firebaseFunctions.httpsCallable('createConversation'),
  
  // Gemini AI functions
  generateResponse: firebaseFunctions.httpsCallable('generateResponse'),
  processAIRequest: firebaseFunctions.httpsCallable('processAIRequest'),
  
  // User management functions
  updateUserProfile: firebaseFunctions.httpsCallable('updateUserProfile'),
  followUser: firebaseFunctions.httpsCallable('followUser'),
  unfollowUser: firebaseFunctions.httpsCallable('unfollowUser'),
  
  // Marketplace functions
  createListing: firebaseFunctions.httpsCallable('createListing'),
  updateListing: firebaseFunctions.httpsCallable('updateListing'),
  deleteListing: firebaseFunctions.httpsCallable('deleteListing'),
  
  // Trading functions
  createTrade: firebaseFunctions.httpsCallable('createTrade'),
  acceptTrade: firebaseFunctions.httpsCallable('acceptTrade'),
  rejectTrade: firebaseFunctions.httpsCallable('rejectTrade'),
  
  // Payment functions
  createStripeSession: firebaseFunctions.httpsCallable('createStripeSession'),
  validatePromoCode: firebaseFunctions.httpsCallable('validatePromoCode'),
};

export default {
  auth: firebaseAuth,
  firestore: firebaseFirestore,
  functions: firebaseFunctions,
  storage: firebaseStorage,
  collections,
  cloudFunctions,
};
