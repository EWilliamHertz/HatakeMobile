/**
 * Network Utilities
 * Handles network connectivity detection and offline functionality
 */

import NetInfo from '@react-native-community/netinfo';
import {Alert} from 'react-native';
import StorageManager from './storage';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled?: boolean;
}

class NetworkManager {
  private static instance: NetworkManager;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };
  private listeners: ((state: NetworkState) => void)[] = [];
  private offlineQueue: any[] = [];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async initialize() {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      const newNetworkState: NetworkState = {
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
        type: state.type,
        isWifiEnabled: state.isWifiEnabled,
      };

      const wasOffline = !this.networkState.isConnected;
      const isNowOnline = newNetworkState.isConnected;

      this.networkState = newNetworkState;

      // Notify listeners
      this.listeners.forEach(listener => listener(newNetworkState));

      // Process offline queue when coming back online
      if (wasOffline && isNowOnline) {
        this.processOfflineQueue();
      }
    });

    // Load offline queue from storage
    this.offlineQueue = await StorageManager.getOfflineQueue();
  }

  public getCurrentState(): NetworkState {
    return this.networkState;
  }

  public isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  public isOffline(): boolean {
    return !this.isOnline();
  }

  public addNetworkListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Offline queue management
  public async addToOfflineQueue(action: string, data: any): Promise<void> {
    const queueItem = {
      id: `${Date.now()}_${Math.random()}`,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queueItem);
    await StorageManager.addToOfflineQueue(action, data);
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} offline actions...`);

    const processedItems: string[] = [];

    for (const item of this.offlineQueue) {
      try {
        await this.executeOfflineAction(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error('Error processing offline action:', error);
        
        // Increment retry count
        item.retryCount = (item.retryCount || 0) + 1;
        
        // Remove from queue if max retries reached
        if (item.retryCount >= 3) {
          processedItems.push(item.id);
          console.warn('Max retries reached for offline action:', item.action);
        }
      }
    }

    // Remove processed items from queue
    this.offlineQueue = this.offlineQueue.filter(
      item => !processedItems.includes(item.id)
    );

    // Update storage
    for (const itemId of processedItems) {
      await StorageManager.removeFromOfflineQueue(itemId);
    }

    if (processedItems.length > 0) {
      Alert.alert(
        'Sync Complete',
        `${processedItems.length} offline actions have been synchronized.`
      );
    }
  }

  private async executeOfflineAction(item: any): Promise<void> {
    // This would contain the logic to execute different types of offline actions
    // For now, we'll just log the action
    console.log('Executing offline action:', item.action, item.data);
    
    // In a real implementation, you would:
    // - Send messages that were queued
    // - Create posts that were saved offline
    // - Update user profiles
    // - Sync marketplace listings
    // etc.
  }

  // Network request wrapper with offline handling
  public async makeRequest<T>(
    requestFn: () => Promise<T>,
    fallbackData?: T,
    cacheKey?: string
  ): Promise<T> {
    if (this.isOffline()) {
      // Try to get cached data
      if (cacheKey) {
        const cachedData = await StorageManager.getCache<T>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      // Return fallback data or throw error
      if (fallbackData !== undefined) {
        return fallbackData;
      }

      throw new Error('No internet connection and no cached data available');
    }

    try {
      const result = await requestFn();
      
      // Cache successful results
      if (cacheKey) {
        await StorageManager.setCache(cacheKey, result, 30); // Cache for 30 minutes
      }
      
      return result;
    } catch (error) {
      // If request fails, try to return cached data
      if (cacheKey) {
        const cachedData = await StorageManager.getCache<T>(cacheKey);
        if (cachedData) {
          console.warn('Request failed, returning cached data');
          return cachedData;
        }
      }

      throw error;
    }
  }

  // Show offline notification
  public showOfflineNotification(): void {
    Alert.alert(
      'No Internet Connection',
      'You are currently offline. Some features may not be available.',
      [{text: 'OK'}]
    );
  }

  // Check if specific feature requires internet
  public requiresInternet(feature: string): boolean {
    const onlineOnlyFeatures = [
      'chat',
      'post_creation',
      'marketplace_listing',
      'user_search',
      'image_upload',
    ];

    return onlineOnlyFeatures.includes(feature);
  }

  // Get connection quality indicator
  public getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (this.isOffline()) {
      return 'offline';
    }

    const { type } = this.networkState;
    
    switch (type) {
      case 'wifi':
        return 'excellent';
      case 'cellular':
        return 'good';
      case '2g':
        return 'poor';
      default:
        return 'good';
    }
  }

  // Optimize requests based on connection
  public shouldOptimizeForBandwidth(): boolean {
    const quality = this.getConnectionQuality();
    return quality === 'poor' || quality === 'offline';
  }

  // Get recommended image quality based on connection
  public getRecommendedImageQuality(): number {
    const quality = this.getConnectionQuality();
    
    switch (quality) {
      case 'excellent':
        return 1.0;
      case 'good':
        return 0.8;
      case 'poor':
        return 0.5;
      default:
        return 0.3;
    }
  }
}

export default NetworkManager.getInstance();
