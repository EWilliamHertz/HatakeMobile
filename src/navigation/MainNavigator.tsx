/**
 * Main Navigator
 * Handles the main app navigation with bottom tabs
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import FeedScreen from '../screens/main/FeedScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import MarketplaceScreen from '../screens/main/MarketplaceScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ItemDetailsScreen from '../screens/main/ItemDetailsScreen';
import CreateListingScreen from '../screens/main/CreateListingScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import {MainTabParamList, RootStackParamList} from '../types';
import {theme} from '../utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const FeedStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Feed" 
      component={FeedScreen} 
      options={{headerShown: false}}
    />
    <Stack.Screen 
      name="CreatePost" 
      component={CreatePostScreen}
      options={{
        title: 'Create Post',
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface,
      }}
    />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ChatList" 
      component={ChatListScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{
        title: 'Chat',
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface,
      }}
    />
  </Stack.Navigator>
);

const MarketplaceStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Marketplace" 
      component={MarketplaceScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen 
      name="ItemDetails" 
      component={ItemDetailsScreen}
      options={{
        title: 'Item Details',
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface,
      }}
    />
    <Stack.Screen 
      name="CreateListing" 
      component={CreateListingScreen}
      options={{
        title: 'Create Listing',
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface,
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{
        title: 'Settings',
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface,
      }}
    />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Feed':
              iconName = 'home';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Marketplace':
              iconName = 'store';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}>
      <Tab.Screen 
        name="Feed" 
        component={FeedStack}
        options={{title: 'Feed'}}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{title: 'Messages'}}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceStack}
        options={{title: 'Marketplace'}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
