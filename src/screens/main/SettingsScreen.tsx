/**
 * Settings Screen
 * User preferences and app settings
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  Button,
  Card,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {UserSettings, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      push: true,
      email: true,
      messages: true,
      follows: true,
      trades: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: 'everyone',
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      fontSize: 'medium',
    },
  });
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const {user, signOut} = useAuth();
  const {firestore, collections} = useFirebase();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const userDoc = await firestore
        .collection(collections.users)
        .doc(user.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.settings) {
          setSettings(userData.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    setLoading(true);
    try {
      await firestore
        .collection(collections.users)
        .doc(user.uid)
        .update({
          settings: newSettings,
          updatedAt: new Date(),
        });

      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: any) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const updateAppearanceSetting = (key: keyof UserSettings['appearance'], value: any) => {
    const newSettings = {
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'DELETE',
                  style: 'destructive',
                  onPress: deleteAccount,
                },
              ],
              {cancelable: true}
            );
          },
        },
      ]
    );
  };

  const deleteAccount = async () => {
    // This would typically call a Cloud Function to handle account deletion
    Alert.alert('Account Deletion', 'Account deletion is not implemented in this demo.');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Notifications */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive push notifications on your device"
              right={() => (
                <Switch
                  value={settings.notifications.push}
                  onValueChange={(value) => updateNotificationSetting('push', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Email Notifications"
              description="Receive notifications via email"
              right={() => (
                <Switch
                  value={settings.notifications.email}
                  onValueChange={(value) => updateNotificationSetting('email', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Message Notifications"
              description="Get notified of new messages"
              right={() => (
                <Switch
                  value={settings.notifications.messages}
                  onValueChange={(value) => updateNotificationSetting('messages', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Follow Notifications"
              description="Get notified when someone follows you"
              right={() => (
                <Switch
                  value={settings.notifications.follows}
                  onValueChange={(value) => updateNotificationSetting('follows', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Trade Notifications"
              description="Get notified of trade updates"
              right={() => (
                <Switch
                  value={settings.notifications.trades}
                  onValueChange={(value) => updateNotificationSetting('trades', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Marketing Emails"
              description="Receive promotional emails"
              right={() => (
                <Switch
                  value={settings.notifications.marketing}
                  onValueChange={(value) => updateNotificationSetting('marketing', value)}
                  disabled={loading}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Privacy */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <List.Item
              title="Profile Visibility"
              description={`Currently: ${settings.privacy.profileVisibility}`}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Show profile visibility options
                Alert.alert('Profile Visibility', 'Feature coming soon');
              }}
            />
            
            <List.Item
              title="Show Email"
              description="Display email on your profile"
              right={() => (
                <Switch
                  value={settings.privacy.showEmail}
                  onValueChange={(value) => updatePrivacySetting('showEmail', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Show Location"
              description="Display location on your profile"
              right={() => (
                <Switch
                  value={settings.privacy.showLocation}
                  onValueChange={(value) => updatePrivacySetting('showLocation', value)}
                  disabled={loading}
                />
              )}
            />
            
            <List.Item
              title="Allow Messages"
              description={`Currently: ${settings.privacy.allowMessages}`}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                // Show message privacy options
                Alert.alert('Message Privacy', 'Feature coming soon');
              }}
            />
          </Card.Content>
        </Card>

        {/* Appearance */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <List.Item
              title="Theme"
              description={`Currently: ${settings.appearance.theme}`}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Theme', 'Dark theme is currently active');
              }}
            />
            
            <List.Item
              title="Language"
              description={`Currently: English`}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Language', 'Additional languages coming soon');
              }}
            />
            
            <List.Item
              title="Font Size"
              description={`Currently: ${settings.appearance.fontSize}`}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Font Size', 'Font size options coming soon');
              }}
            />
          </Card.Content>
        </Card>

        {/* Account */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <List.Item
              title="Export Data"
              description="Download your data"
              left={() => <List.Icon icon="download" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Export Data', 'Data export feature coming soon');
              }}
            />
            
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={() => <List.Icon icon="shield-account" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Privacy Policy', 'Privacy policy will be available soon');
              }}
            />
            
            <List.Item
              title="Terms of Service"
              description="Read our terms of service"
              left={() => <List.Icon icon="file-document" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert('Terms of Service', 'Terms of service will be available soon');
              }}
            />
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.card, styles.dangerCard]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
            
            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.dangerButton}
              textColor={theme.colors.error}
              icon="logout">
              Sign Out
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleDeleteAccount}
              style={styles.dangerButton}
              textColor={theme.colors.error}
              icon="delete">
              Delete Account
            </Button>
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>GeminiHatake Mobile</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
          <Text style={styles.appInfoText}>Built with React Native</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  dangerCard: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  dangerTitle: {
    color: theme.colors.error,
  },
  dangerButton: {
    marginVertical: theme.spacing.xs,
    borderColor: theme.colors.error,
  },
  appInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  appInfoText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginBottom: theme.spacing.xs,
  },
});

export default SettingsScreen;
