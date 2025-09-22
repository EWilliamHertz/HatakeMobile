/**
 * Forgot Password Screen
 * Allows users to reset their password via email
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {AuthStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const {resetPassword} = useAuth();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'A password reset email has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      let errorMessage = 'An error occurred while sending the reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const resendEmail = () => {
    setEmailSent(false);
    handleResetPassword();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Title style={styles.title}>Reset Password</Title>
            <Paragraph style={styles.subtitle}>
              {emailSent
                ? 'Check your email for reset instructions'
                : 'Enter your email address to receive password reset instructions'}
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {!emailSent ? (
                <>
                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    style={styles.input}
                    theme={{colors: {primary: theme.colors.primary}}}
                    disabled={loading}
                  />

                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.resetButton}
                    contentStyle={styles.buttonContent}
                    disabled={loading || !email.trim()}
                    loading={loading}>
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Paragraph style={styles.successText}>
                    A password reset email has been sent to:
                  </Paragraph>
                  <Text style={styles.emailText}>{email}</Text>
                  
                  <Paragraph style={styles.instructionText}>
                    Please check your inbox and spam folder. If you don't receive the email within a few minutes, you can request another one.
                  </Paragraph>

                  <Button
                    mode="outlined"
                    onPress={resendEmail}
                    style={styles.resendButton}
                    disabled={loading}>
                    Resend Email
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <Button
              mode="text"
              onPress={navigateToLogin}
              disabled={loading}
              style={styles.backButton}>
              Back to Sign In
            </Button>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.8,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  resendButton: {
    borderColor: theme.colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.onBackground,
    marginRight: theme.spacing.xs,
  },
  backButton: {
    marginLeft: theme.spacing.xs,
  },
});

export default ForgotPasswordScreen;
