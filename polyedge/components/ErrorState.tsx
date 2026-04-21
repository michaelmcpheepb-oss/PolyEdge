import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export type ErrorType = 
  | 'network' 
  | 'api' 
  | 'empty_feed' 
  | 'empty_whales' 
  | 'empty_alerts' 
  | 'empty_following' 
  | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  compact?: boolean;
}

const ERROR_CONFIGS: Record<ErrorType, {
  icon: string;
  defaultTitle: string;
  defaultMessage: string;
  actionLabel?: string;
}> = {
  network: {
    icon: 'wifi-off',
    defaultTitle: 'No internet connection',
    defaultMessage: 'Check your connection and try again',
    actionLabel: 'Retry',
  },
  api: {
    icon: 'warning',
    defaultTitle: 'Could not load data',
    defaultMessage: 'Something went wrong. Please try again.',
    actionLabel: 'Retry',
  },
  empty_feed: {
    icon: '🔍',
    defaultTitle: 'No markets for these categories',
    defaultMessage: 'Try adjusting your filters',
    actionLabel: 'Edit Filters',
  },
  empty_whales: {
    icon: '🐋',
    defaultTitle: 'No whale trades above your threshold',
    defaultMessage: 'Lower your threshold to see more trades',
    actionLabel: 'Adjust Threshold',
  },
  empty_alerts: {
    icon: '🔔',
    defaultTitle: 'No alerts set yet',
    defaultMessage: 'Create your first alert to get notified',
    actionLabel: '+ Create Alert',
  },
  empty_following: {
    icon: '🏅',
    defaultTitle: 'No traders followed yet',
    defaultMessage: 'Follow traders to see their moves here',
    actionLabel: 'Browse Leaderboard',
  },
  generic: {
    icon: 'alert-circle',
    defaultTitle: 'Something went wrong',
    defaultMessage: 'Please try again or contact support',
    actionLabel: 'Retry',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  onAction,
  actionLabel,
  compact = false,
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];
  const isEmoji = config.icon.length === 2; // Simple emoji detection
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
        <Text style={styles.compactText}>
          {title || config.defaultTitle}
        </Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetryButton}>
            <Text style={styles.compactRetryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {isEmoji ? (
          <Text style={styles.emojiIcon}>{config.icon}</Text>
        ) : (
          <Ionicons 
            name={config.icon as any} 
            size={48} 
            color={Colors.textPrimary} 
          />
        )}
      </View>
      
      <Text style={styles.title}>
        {title || config.defaultTitle}
      </Text>
      
      <Text style={styles.message}>
        {message || config.defaultMessage}
      </Text>
      
      <View style={styles.actions}>
        {(onRetry || config.actionLabel) && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>
              {config.actionLabel || 'Try Again'}
            </Text>
          </TouchableOpacity>
        )}
        
        {onAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onAction}
          >
            <Text style={styles.actionButtonText}>
              {actionLabel || 'Take Action'}
            </Text>
          </TouchableOpacity>
        )}
        
        {type === 'network' && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              // In a real app, this would open network settings
              console.log('Open network settings');
            }}
          >
            <Text style={styles.secondaryButtonText}>Open Network Settings</Text>
          </TouchableOpacity>
        )}
        
        {type === 'unauthorized' && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              // In a real app, this would navigate to sign in
              console.log('Navigate to sign in');
            }}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Support contact for server errors */}
      {(type === 'server' || type === 'payment') && (
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            Still having issues?{' '}
            <Text 
              style={styles.supportLink}
              onPress={() => console.log('Contact support')}
            >
              Contact support
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0D0D1A',
  },
  emojiIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  compactRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  compactRetryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#A0A0B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  supportContainer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
    maxWidth: 300,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  supportLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});

// Empty state component
interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconContainer}>
        <Ionicons name={icon as any} size={64} color={Colors.textSecondary} />
      </View>
      
      <Text style={emptyStyles.title}>{title}</Text>
      
      {message && (
        <Text style={emptyStyles.message}>{message}</Text>
      )}
      
      {onAction && actionLabel && (
        <TouchableOpacity 
          style={emptyStyles.actionButton}
          onPress={onAction}
        >
          <Text style={emptyStyles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});

// Loading skeleton component
export function LoadingSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.card}>
          <View style={skeletonStyles.header}>
            <View style={skeletonStyles.category} />
            <View style={skeletonStyles.time} />
          </View>
          <View style={skeletonStyles.title} />
          <View style={skeletonStyles.stats}>
            <View style={skeletonStyles.stat} />
            <View style={skeletonStyles.stat} />
            <View style={skeletonStyles.stat} />
          </View>
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  category: {
    width: 60,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  time: {
    width: 40,
    height: 20,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
  },
  title: {
    width: '80%',
    height: 24,
    backgroundColor: Colors.elevated,
    borderRadius: 4,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.elevated,
    borderRadius: 8,
  },
});