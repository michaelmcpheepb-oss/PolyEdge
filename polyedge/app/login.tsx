import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        Alert.alert(
          'Success!',
          'Your account has been created. Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        await signIn(email, password);
        router.back();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address to reset your password',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: async (email) => {
            if (email) {
              try {
                // This would call resetPassword function
                Alert.alert('Check Your Email', 'Password reset instructions have been sent.');
              } catch (error) {
                Alert.alert('Error', 'Failed to send reset email. Please try again.');
              }
            }
          }
        },
      ],
      'plain-text',
      email
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="analytics" size={64} color={Colors.accent} />
            </View>
            <Text style={styles.heroTitle}>
              {isSignUp ? 'Join PolyEdge' : 'Welcome Back'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isSignUp 
                ? 'Create your account to track markets like a pro'
                : 'Sign in to access your personalized feed and alerts'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {!isSignUp && (
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Ionicons name="time" size={20} color={Colors.background} />
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name={isSignUp ? 'person-add' : 'log-in'} size={20} color={Colors.background} />
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Alert.alert('Coming Soon', 'Social login will be available soon')}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color={Colors.textPrimary} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Alert.alert('Coming Soon', 'Social login will be available soon')}
                disabled={isLoading}
              >
                <Ionicons name="logo-apple" size={24} color={Colors.textPrimary} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Toggle Sign Up/Sign In */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                <Text style={styles.toggleLink}>
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            {isSignUp && (
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text 
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Terms', 'Terms of Service')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text 
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
    padding: 0,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.background,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  toggleLink: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});