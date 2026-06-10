// VideoSnap — Generate Screen (Main Video Creation)
import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Colors, Fonts, Spacing, BorderRadius } from '../lib/theme'
import { VIDEO_STYLES, type VideoStyle } from '../lib/constants'
import { createVideo } from '../lib/api'

const { width } = Dimensions.get('window')
const STYLE_SIZE = (width - Spacing.xl * 2 - Spacing.sm * 2) / 3

export default function GenerateScreen() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('cinematic')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      base64: true,
    })
    if (!result.canceled && result.assets[0]) {
      setUploadedImage(result.assets[0].uri)
      setUploadedBase64(result.assets[0].base64 || null)
      setError(null)
    }
  }

  // Upload image to an image hosting service or our backend
  async function uploadImageForVideo(uri: string): Promise<string> {
    // For now, we upload to our backend which handles R2 storage
    const formData = new FormData()
    const filename = uri.split('/').pop() || 'photo.jpg'
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
    
    formData.append('file', {
      uri,
      name: `videosnap_${Date.now()}.${ext}`,
      type: mimeType,
    } as any)
    
    // Use the R2 upload endpoint from selfyhai-backend
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || ''}/api/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  async function handleGenerate() {
    if (!uploadedImage) {
      setError('Please upload a photo first')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProcessingStatus('Uploading image...')

    try {
      // Step 1: Upload image
      const imageUrl = await uploadImageForVideo(uploadedImage)
      setProcessingStatus('Creating video...')

      // Get auth token from stored session
      const sessionStr = localStorage.getItem('videosnap_session')
      let authToken = ''
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        authToken = session.access_token
      }

      // Step 2: Find the selected style
      const style = VIDEO_STYLES.find(s => s.key === selectedStyle)
      const stylePrompt = style ? style.prompt : ''
      const fullPrompt = prompt
        ? `${prompt}, ${stylePrompt}`
        : stylePrompt

      // Step 3: Create video task
      const result = await createVideo(imageUrl, fullPrompt, selectedStyle, authToken)
      setVideoId(result.videoId)

      // Step 4: Poll for completion
      setProcessingStatus('AI is generating your video...')
      
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000))
        
        const statusRes = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL || ''}/api/video/${result.videoId}`,
          {
            headers: authToken ? {
              'Authorization': `Bearer ${authToken}`,
              'apikey': authToken,
            } : {},
          }
        )
        const status = await statusRes.json()
        
        if (status.status === 'completed' && status.videoUrl) {
          setProcessingStatus(null)
          setIsGenerating(false)
          // Navigate to player with the video URL
          router.push({
            pathname: '/player',
            params: { videoUrl: status.videoUrl, imageUrl: imageUrl }
          })
          return
        }
        
        if (status.status === 'failed') {
          throw new Error('Video generation failed on server')
        }
      }
      
      throw new Error('Generation timed out. Please try again.')
    } catch (err: any) {
      setError(err.message)
      setProcessingStatus(null)
      setIsGenerating(false)
    }
  }

  const selectedStyleData = VIDEO_STYLES.find(s => s.key === selectedStyle)
  const canGenerate = uploadedImage !== null

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Create Video</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Upload Zone */}
        <Pressable style={styles.uploadZone} onPress={pickImage}>
          {uploadedImage ? (
            <View style={styles.uploadedContainer}>
              <Image source={{ uri: uploadedImage }} style={styles.uploadedPreview} resizeMode="cover" />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadIcon}>📷</Text>
              </View>
              <Text style={styles.uploadTitle}>Upload your photo</Text>
              <Text style={styles.uploadSubtitle}>Any photo becomes a cinematic video</Text>
            </View>
          )}
        </Pressable>

        {/* Style Selector */}
        <Text style={styles.sectionTitle}>Style</Text>
        <View style={styles.styleRow}>
          {VIDEO_STYLES.map((style) => {
            const isActive = selectedStyle === style.key
            return (
              <Pressable
                key={style.key}
                style={styles.styleItem}
                onPress={() => setSelectedStyle(style.key as VideoStyle)}
              >
                <View style={[
                  styles.styleCard,
                  { backgroundColor: style.gradient[0] },
                  isActive && styles.styleCardActive
                ]}>
                  <Text style={styles.styleEmoji}>{style.emoji}</Text>
                </View>
                <Text style={[styles.styleLabel, isActive && styles.styleLabelActive]}>
                  {style.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Prompt Input */}
        <Text style={styles.sectionTitle}>Prompt (optional)</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="Describe the vibe..."
          placeholderTextColor={Colors.textMuted}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={2}
        />

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {isGenerating ? (
          <View style={styles.generatingOverlay}>
            <ActivityIndicator color={Colors.accent} size="small" />
            <Text style={styles.generatingText}>{processingStatus || 'Processing...'}</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!canGenerate}
          >
            <Text style={styles.generateText}>Generate Video ✦ 1 credit</Text>
          </Pressable>
        )}
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
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  // Upload zone
  uploadZone: {
    height: 220,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing['2xl'],
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  uploadSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
  uploadedContainer: {
    flex: 1,
  },
  uploadedPreview: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  changeText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  // Style selector
  sectionTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  styleItem: {
    alignItems: 'center',
    width: STYLE_SIZE,
    gap: 4,
  },
  styleCard: {
    width: STYLE_SIZE,
    height: STYLE_SIZE,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleCardActive: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  styleEmoji: {
    fontSize: 32,
  },
  styleLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  styleLabelActive: {
    color: Colors.text,
    fontWeight: Fonts.weights.semibold,
  },
  // Prompt input
  promptInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing['2xl'],
  },
  // Error
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.sizes.sm,
  },
  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: 36,
    backgroundColor: Colors.bg,
  },
  generateButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.3,
  },
  generateText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: '#000',
  },
  generatingOverlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  generatingText: {
    fontSize: Fonts.sizes.base,
    color: Colors.accent,
    fontWeight: Fonts.weights.medium,
  },
})
