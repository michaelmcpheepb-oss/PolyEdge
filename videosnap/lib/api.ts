// VideoSnap API client

import { API_BASE_URL } from './constants'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  authToken?: string
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, authToken } = options

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (authToken) {
    fetchHeaders['Authorization'] = `Bearer ${authToken}`
    fetchHeaders['apikey'] = authToken
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

// Video generation
export async function createVideo(
  imageUrl: string,
  prompt: string,
  style: string,
  authToken: string
) {
  return apiRequest<{ success: boolean; videoId: string; taskId: string; status: string }>(
    '/api/video',
    {
      method: 'POST',
      body: { imageUrl, prompt, style },
      authToken,
    }
  )
}

export async function getVideoStatus(
  videoId: string,
  authToken: string
) {
  return apiRequest<{ success: boolean; status: string; videoUrl?: string }>(
    `/api/video/${videoId}`,
    { authToken }
  )
}

// Auth
export async function signIn(email: string, password: string) {
  return apiRequest<{ user: any; session: any }>('/api/auth/signin', {
    method: 'POST',
    body: { email, password },
  })
}

export async function signUp(email: string, password: string) {
  return apiRequest<{ user: any; session: any }>('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  })
}

// Credit check
export async function getCredits(authToken: string) {
  return apiRequest<{ credits: number }>('/api/credits', { authToken })
}
