/**
 * Theme Configuration
 * Defines the app's color scheme and styling to match the web version
 */

import {DefaultTheme} from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors matching the web app's dark theme
    primary: '#3B82F6', // Blue-500
    primaryContainer: '#1E40AF', // Blue-700
    secondary: '#10B981', // Emerald-500
    secondaryContainer: '#059669', // Emerald-600
    
    // Background colors for dark theme
    background: '#111827', // Gray-900
    surface: '#1F2937', // Gray-800
    surfaceVariant: '#374151', // Gray-700
    
    // Text colors
    onBackground: '#F9FAFB', // Gray-50
    onSurface: '#F3F4F6', // Gray-100
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    
    // Additional colors
    error: '#EF4444', // Red-500
    errorContainer: '#DC2626', // Red-600
    onError: '#FFFFFF',
    
    // Custom colors for the app
    accent: '#8B5CF6', // Purple-500
    success: '#10B981', // Emerald-500
    warning: '#F59E0B', // Amber-500
    info: '#06B6D4', // Cyan-500
    
    // Chat colors
    userMessage: '#3B82F6', // Blue-500
    aiMessage: '#6B7280', // Gray-500
    systemMessage: '#10B981', // Emerald-500
    
    // Border and divider colors
    outline: '#4B5563', // Gray-600
    outlineVariant: '#6B7280', // Gray-500
  },
  
  // Typography
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  roundness: 8,
  
  // Shadows
  elevation: {
    level0: 0,
    level1: 1,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

export type Theme = typeof theme;
