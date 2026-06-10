// VideoSnap — Player Screen
import { useState, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Share, Dimensions, Platform } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors, Fonts, Spacing, BorderRadius } from '../lib/theme'
import { Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const { width } = Dimensions.get('window')

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ videoUrl: string; imageUrl: string }>()
  const videoRef = useRef<Video>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [downloading, setDownloading] = useState(false)

  async function handleShare() {
    try {
      setDownloading(true)
      
      // Download the video locally
      const localUri = FileSystem.cacheDirectory + 'videosnap_share.mp4'
      await FileSystem.downloadAsync(params.videoUrl || '', localUri)
      
      // Share on native platforms
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share your VideoSnap!',
        })
      } else {
        // Web fallback — copy URL
        await Share.share({
          url: params.videoUrl || '',
          title: 'Check out my VideoSnap!',
          message: `Check out my AI video! ${params.videoUrl || ''}`,
        })
      }
    } catch (err: any) {
      console.log('Share error:', err.message)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDownload() {
    try {
      setDownloading(true)
      const localUri = FileSystem.documentDirectory + `videosnap_${Date.now()}.mp4`
      await FileSystem.downloadAsync(params.videoUrl || '', localUri)
      
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'video/mp4',
        })
      }
    } catch (err: any) {
      console.log('Download error:', err.message)
    } finally {
      setDownloading(false)
    }
  }

  function handleCreateAnother() {
    router.replace('/generate')
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Your Video</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: params.videoUrl || '' }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
          useNativeControls
          onError={(e) => console.log('Video error:', e)}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={handleShare}>
          <Text style={styles.btnText}>{downloading ? 'Processing...' : 'Share →'}</Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryBtn} onPress={handleDownload}>
            <Text style={styles.secondaryBtnText}>Download</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleCreateAnother}>
            <Text style={styles.secondaryBtnText}>Create Another</Text>
          </Pressable>
        </View>
      </View>

      {/* Music Hint */}
      <View style={styles.musicHint}>
        <Text style={styles.musicText}>🎵 AI music coming soon</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 54,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
  },
  backText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  headerRight: {
    width: 40,
  },
  videoContainer: {
    width: width,
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  actions: {
    padding: Spacing.xl,
    gap: Spacing.md,
    marginTop: Spacing['2xl'],
  },
  primaryBtn: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: '#000',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  musicHint: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  musicText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
})
