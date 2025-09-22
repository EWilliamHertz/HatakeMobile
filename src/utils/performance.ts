/**
 * Performance Optimization Utilities
 * Tools for improving app performance and user experience
 */

import {Dimensions, PixelRatio} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export class PerformanceUtils {
  // Image optimization
  static optimizeImageSize(originalWidth: number, originalHeight: number, maxWidth: number = 800): {width: number; height: number} {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth <= maxWidth) {
      return {width: originalWidth, height: originalHeight};
    }
    
    const optimizedWidth = maxWidth;
    const optimizedHeight = maxWidth / aspectRatio;
    
    return {width: optimizedWidth, height: optimizedHeight};
  }

  // Get optimal image quality based on device and network
  static getOptimalImageQuality(): number {
    const pixelRatio = PixelRatio.get();
    
    // Adjust quality based on pixel density
    if (pixelRatio >= 3) {
      return 0.8; // High DPI devices
    } else if (pixelRatio >= 2) {
      return 0.9; // Medium DPI devices
    } else {
      return 1.0; // Low DPI devices
    }
  }

  // Debounce function for search and input
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory management for large lists
  static getOptimalItemHeight(): number {
    // Calculate optimal item height based on screen size
    return Math.max(80, screenHeight * 0.1);
  }

  static getOptimalWindowSize(): number {
    // Calculate optimal window size for FlatList
    return Math.ceil(screenHeight / this.getOptimalItemHeight()) + 5;
  }

  // Batch operations for better performance
  static batchOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      const results: T[] = [];
      
      try {
        for (let i = 0; i < operations.length; i += batchSize) {
          const batch = operations.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(op => op()));
          results.push(...batchResults);
          
          // Small delay between batches to prevent blocking
          if (i + batchSize < operations.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Lazy loading helper
  static createLazyLoader<T>(
    loadFunction: (page: number) => Promise<T[]>,
    pageSize: number = 20
  ) {
    let currentPage = 0;
    let loading = false;
    let hasMore = true;
    
    return {
      async loadMore(): Promise<T[]> {
        if (loading || !hasMore) {
          return [];
        }
        
        loading = true;
        
        try {
          const results = await loadFunction(currentPage);
          
          if (results.length < pageSize) {
            hasMore = false;
          }
          
          currentPage++;
          return results;
        } finally {
          loading = false;
        }
      },
      
      reset() {
        currentPage = 0;
        loading = false;
        hasMore = true;
      },
      
      get isLoading() {
        return loading;
      },
      
      get canLoadMore() {
        return hasMore && !loading;
      }
    };
  }

  // Memory usage monitoring
  static logMemoryUsage(context: string): void {
    if (__DEV__) {
      // In development, we can add memory monitoring
      console.log(`[Memory] ${context}: ${Date.now()}`);
    }
  }

  // Performance timing
  static createTimer(name: string) {
    const startTime = Date.now();
    
    return {
      end(): number {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (__DEV__) {
          console.log(`[Performance] ${name}: ${duration}ms`);
        }
        
        return duration;
      }
    };
  }

  // Optimize text rendering
  static shouldUseTextBreakStrategy(): boolean {
    // Use balanced text break strategy on supported platforms
    return true;
  }

  // Image caching strategy
  static getCacheStrategy(imageSize: 'thumbnail' | 'medium' | 'large'): {
    maxAge: number;
    maxSize: number;
  } {
    switch (imageSize) {
      case 'thumbnail':
        return {maxAge: 7 * 24 * 60 * 60 * 1000, maxSize: 50}; // 7 days, 50MB
      case 'medium':
        return {maxAge: 3 * 24 * 60 * 60 * 1000, maxSize: 100}; // 3 days, 100MB
      case 'large':
        return {maxAge: 24 * 60 * 60 * 1000, maxSize: 200}; // 1 day, 200MB
      default:
        return {maxAge: 24 * 60 * 60 * 1000, maxSize: 100};
    }
  }

  // Screen size utilities
  static getScreenDimensions() {
    return {
      width: screenWidth,
      height: screenHeight,
      isTablet: screenWidth >= 768,
      isSmallScreen: screenWidth < 375,
      pixelRatio: PixelRatio.get(),
    };
  }

  // Responsive sizing
  static responsiveSize(size: number): number {
    const scale = screenWidth / 375; // Base on iPhone X width
    return Math.round(size * scale);
  }

  // Animation optimization
  static getOptimalAnimationDuration(distance: number): number {
    // Calculate optimal animation duration based on distance
    const baseDuration = 200;
    const maxDuration = 500;
    
    const calculatedDuration = baseDuration + (distance / screenWidth) * 200;
    return Math.min(calculatedDuration, maxDuration);
  }

  // List optimization
  static getListOptimizations() {
    return {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 15,
      windowSize: 10,
      getItemLayout: (data: any, index: number) => ({
        length: this.getOptimalItemHeight(),
        offset: this.getOptimalItemHeight() * index,
        index,
      }),
    };
  }
}

export default PerformanceUtils;
