import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useState } from 'react';
import { sendMagicLink } from '../services/auth-magic';

const { height } = Dimensions.get('window');

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function AuthSheet({ visible, onClose }: AuthSheetProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendMagicLink(email.trim());
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSent(false);
    setError(null);
  };

  const renderForm = () => (
    <>
      <Text style={styles.title}>Sign in to PolyEdge</Text>
      <Text style={styles.subtitle}>
        Enter your email and we will send you a magic link — no password needed.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={Colors.textTertiary}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isLoading}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleSendMagicLink}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.background} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Send Magic Link</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderSuccess = () => (
    <>
      <Text style={styles.emoji}>✉️</Text>
      <Text style={styles.title}>Check your email!</Text>
      <Text style={styles.subtitle}>
        We sent a magic link to {'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => {
          // This would open the email app
          console.log('Open email app');
        }}
      >
        <Text style={styles.outlineButtonText}>Open Email App</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleReset}
      >
        <Text style={styles.secondaryButtonText}>Use a different email</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.dragHandle} />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.content}>
            {isSent ? renderSuccess() : renderForm()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#16213E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  content: {
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0D0D1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A45',
    color: Colors.textPrimary,
    fontSize: 16,
    height: 52,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 20,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.accent,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});