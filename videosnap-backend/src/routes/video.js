import { Router } from 'express'
import { db } from '../index.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadImage } from '../storage/r2.js'
import { createImageToVideoTask, queryTask, downloadVideo, isConfigured } from '../services/kling.js'

export const videoRoutes = Router()

/**
 * POST /api/video — Create a video generation task
 */
videoRoutes.post('/', requireAuth, async (req, res) => {
  try {
    const { imageUrl, prompt, style } = req.body
    const userId = req.user.id

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'imageUrl is required' })
    }

    if (!isConfigured()) {
      return res.status(400).json({ success: false, error: 'Kling API is not configured' })
    }

    // Check credits — if user has no subscription, deduct a credit
    const { data: userData } = await db.from('users').select('credits, is_subscribed').eq('id', userId).single()

    if (!userData?.is_subscribed && userData?.credits !== undefined && userData.credits <= 0) {
      return res.status(402).json({
        success: false,
        error: 'No credits remaining. Please purchase more or subscribe.',
        needsPayment: true
      })
    }

    // Create Kling task
    const klingTaskId = await createImageToVideoTask(imageUrl, prompt)

    // Save to DB
    const { data, error } = await db
      .from('videos')
      .insert({
        user_id: userId,
        source_image_url: imageUrl,
        prompt: prompt || null,
        style: style || 'cinematic',
        kling_task_id: klingTaskId,
        status: 'processing'
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to save video record: ${error.message}`)
    }

    // Deduct credit if not subscribed
    if (!userData?.is_subscribed) {
      await db.rpc('add_credits', { p_user_id: userId, p_credits: -1 })
    }

    console.log('[Video] Created task for user', userId, { videoId: data.id, klingTaskId })

    return res.json({
      success: true,
      videoId: data.id,
      taskId: klingTaskId,
      status: 'processing'
    })
  } catch (err) {
    console.error('[Video] POST error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/video/:id — Check video status
 */
videoRoutes.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: video, error } = await db
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !video) {
      return res.status(404).json({ success: false, error: 'Video not found' })
    }

    if (video.status === 'completed') {
      return res.json({ success: true, status: 'completed', videoUrl: video.video_url })
    }
    if (video.status === 'failed') {
      return res.json({ success: true, status: 'failed' })
    }

    // Poll Kling
    const result = await queryTask(video.kling_task_id)

    if (result.status === 'succeed' && result.videoUrl) {
      const videoBuffer = await downloadVideo(result.videoUrl)
      const r2Url = await uploadImage(
        `videosnap/videos/${video.user_id}/${id}.mp4`,
        videoBuffer,
        'video/mp4'
      )

      await db.from('videos').update({
        status: 'completed', video_url: r2Url, updated_at: new Date().toISOString()
      }).eq('id', id)

      console.log('[Video] Completed:', { videoId: id })
      return res.json({ success: true, status: 'completed', videoUrl: r2Url })
    }

    if (result.status === 'failed') {
      await db.from('videos').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', id)
      return res.json({ success: true, status: 'failed' })
    }

    return res.json({ success: true, status: 'processing' })
  } catch (err) {
    console.error('[Video] GET error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})
