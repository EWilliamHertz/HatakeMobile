/**
 * TypeScript Type Definitions
 * Defines interfaces and types used throughout the app
 */

// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  customClaims?: {[key: string]: any};
  createdAt?: Date;
  updatedAt?: Date;
  bio?: string;
  location?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  isAdmin?: boolean;
  isContentCreator?: boolean;
}

// Message and Chat types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'user' | 'ai' | 'system';
  conversationId: string;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
  createdAt: Date;
  isAIConversation: boolean;
  metadata?: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
  };
}

// Post and Feed types
export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
  likes: string[];
  comments: Comment[];
  shares: number;
  images?: string[];
  type: 'text' | 'image' | 'poll' | 'article';
  visibility: 'public' | 'followers' | 'private';
  tags?: string[];
  groupId?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
  likes: string[];
  replies?: Comment[];
}

// Marketplace types
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  sellerId: string;
  sellerName: string;
  images: string[];
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'sold' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  shipping?: {
    cost: number;
    methods: string[];
    locations: string[];
  };
}

// Trading types
export interface Trade {
  id: string;
  initiatorId: string;
  receiverId: string;
  initiatorItems: MarketplaceItem[];
  receiverItems: MarketplaceItem[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  messages: TradeMessage[];
  createdAt: Date;
  updatedAt: Date;
  escrowId?: string;
}

export interface TradeMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'offer' | 'counter-offer' | 'acceptance' | 'rejection';
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: {conversationId?: string};
  Profile: {userId?: string};
  Settings: undefined;
  Marketplace: undefined;
  ItemDetails: {itemId: string};
  CreateListing: undefined;
  Trade: {tradeId: string};
  Article: {articleId: string};
  CreatePost: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Chat: undefined;
  Marketplace: undefined;
  Profile: undefined;
  More: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Firebase Cloud Function types
export interface CloudFunctionResponse<T = any> {
  data: T;
}

export interface GeminiRequest {
  prompt: string;
  conversationId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface GeminiResponse {
  response: string;
  model: string;
  tokens: number;
  processingTime: number;
  conversationId: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'follow' | 'like' | 'comment' | 'trade' | 'system';
  title: string;
  body: string;
  data?: {[key: string]: any};
  read: boolean;
  createdAt: Date;
}

// Settings types
export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    messages: boolean;
    follows: boolean;
    trades: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: 'everyone' | 'followers' | 'none';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  };
}
