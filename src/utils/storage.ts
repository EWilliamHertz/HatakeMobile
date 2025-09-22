/**
 * Local Storage Utilities
 * Handles local data persistence for offline support and caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Cache management with expiration
  async setCache<T>(key: string, data: T, expirationMinutes?: number): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined,
    };
    await this.setItem(`cache_${key}`, cacheItem);
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cacheItem = await this.getItem<CacheItem<T>>(`cache_${key}`);
      
      if (!cacheItem) {
        return null;
      }

      // Check if cache has expired
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error retrieving cache:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // User preferences
  async setUserPreference(key: string, value: any): Promise<void> {
    await this.setItem(`pref_${key}`, value);
  }

  async getUserPreference<T>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.getItem<T>(`pref_${key}`);
    return value !== null ? value : (defaultValue || null);
  }

  // Draft management for posts and messages
  async saveDraft(type: 'post' | 'message' | 'listing', data: any): Promise<void> {
    const draftKey = `draft_${type}_${Date.now()}`;
    await this.setItem(draftKey, {
      ...data,
      createdAt: Date.now(),
      type,
    });
  }

  async getDrafts(type: 'post' | 'message' | 'listing'): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter(key => key.startsWith(`draft_${type}_`));
      
      const drafts = await Promise.all(
        draftKeys.map(async (key) => {
          const draft = await this.getItem(key);
          return { key, ...draft };
        })
      );

      return drafts.filter(draft => draft !== null);
    } catch (error) {
      console.error('Error retrieving drafts:', error);
      return [];
    }
  }

  async deleteDraft(draftKey: string): Promise<void> {
    await this.removeItem(draftKey);
  }

  // Offline queue management
  async addToOfflineQueue(action: string, data: any): Promise<void> {
    try {
      const queue = await this.getItem<any[]>('offline_queue') || [];
      queue.push({
        id: `${Date.now()}_${Math.random()}`,
        action,
        data,
        timestamp: Date.now(),
      });
      await this.setItem('offline_queue', queue);
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  async getOfflineQueue(): Promise<any[]> {
    return await this.getItem<any[]>('offline_queue') || [];
  }

  async removeFromOfflineQueue(itemId: string): Promise<void> {
    try {
      const queue = await this.getItem<any[]>('offline_queue') || [];
      const updatedQueue = queue.filter(item => item.id !== itemId);
      await this.setItem('offline_queue', updatedQueue);
    } catch (error) {
      console.error('Error removing from offline queue:', error);
    }
  }

  async clearOfflineQueue(): Promise<void> {
    await this.removeItem('offline_queue');
  }

  // Recent searches
  async addRecentSearch(query: string, type: 'posts' | 'marketplace' | 'users'): Promise<void> {
    try {
      const recentKey = `recent_${type}`;
      const recent = await this.getItem<string[]>(recentKey) || [];
      
      // Remove if already exists
      const filtered = recent.filter(item => item !== query);
      
      // Add to beginning and limit to 10 items
      const updated = [query, ...filtered].slice(0, 10);
      
      await this.setItem(recentKey, updated);
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  }

  async getRecentSearches(type: 'posts' | 'marketplace' | 'users'): Promise<string[]> {
    return await this.getItem<string[]>(`recent_${type}`) || [];
  }

  async clearRecentSearches(type: 'posts' | 'marketplace' | 'users'): Promise<void> {
    await this.removeItem(`recent_${type}`);
  }
}

export default StorageManager.getInstance();
