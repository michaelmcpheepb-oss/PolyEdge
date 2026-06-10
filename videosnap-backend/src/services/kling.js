import jwt from 'jsonwebtoken'

const BASE_URL = process.env.KLING_BASE_URL || 'https://api-singapore.klingai.com'

export function generateToken() {
  const accessKey = process.env.KLING_ACCESS_KEY
  const secretKey = process.env.KLING_SECRET_KEY
  if (!accessKey || !secretKey) {
    throw new Error('KLING_ACCESS_KEY and KLING_SECRET_KEY must be configured')
  }
  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    { iss: accessKey, exp: now + 1800, nbf: now - 5 },
    secretKey,
    { algorithm: 'HS256', header: { alg: 'HS256', typ: 'JWT' } }
  )
}

async function klingRequest(path, options = {}) {
  const token = generateToken()
  const url = `${BASE_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  const data = await response.json()
  if (!response.ok || data.code !== 0) {
    throw new Error(`Kling API error [${response.status}]: ${data.message || 'Unknown error'}`)
  }
  return data
}

export async function createImageToVideoTask(imageUrl, prompt) {
  if (!imageUrl) throw new Error('imageUrl is required')
  console.log('[Kling] Creating task:', { imageUrl, prompt })

  const body = { model: 'kling-v2-1', image: imageUrl, duration: 5 }
  if (prompt) body.prompt = prompt

  const data = await klingRequest('/v1/videos/image2video', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const taskId = data.data?.task_id
  if (!taskId) throw new Error('Kling did not return a task_id')
  return taskId
}

export async function queryTask(taskId) {
  if (!taskId) throw new Error('taskId is required')
  const data = await klingRequest(`/v1/videos/image2video/${taskId}`)
  const taskStatus = data.data?.task_status
  const videoUrl = data.data?.task_result?.videos?.[0]?.url || null
  return { status: taskStatus, videoUrl }
}

export async function downloadVideo(videoUrl) {
  if (!videoUrl) throw new Error('videoUrl is required')
  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error(`Failed to download video: HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

export function isConfigured() {
  return !!(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY)
}
