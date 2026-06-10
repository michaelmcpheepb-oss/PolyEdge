import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createClient } from '@supabase/supabase-js'
import { Stripe } from 'stripe'

// Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

// Supabase client (direct to PostgREST, same as selfyhai-backend)
function getBaseUrl() {
  return process.env.SUPABASE_DB_URL || 'http://172.19.0.6:3000'
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
}

// Thin PostgREST query builder (forked from selfyhai-backend)
class QueryBuilder {
  constructor(table) {
    this._table = table
    this._params = new URLSearchParams()
    this._method = null
    this._body = null
    this._filters = []
    this._singleRow = false
    this._maybeSingle = false
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject)
  }

  select(columns = '*') {
    if (!this._method) this._method = 'GET'
    this._params.set('select', columns)
    return this
  }

  insert(row) {
    this._method = 'POST'
    this._body = Array.isArray(row) ? row : [row]
    this._params.set('select', '*')
    return this
  }

  update(updates) {
    this._method = 'PATCH'
    this._body = updates
    return this
  }

  delete() {
    this._method = 'DELETE'
    return this
  }

  eq(col, val) { this._filters.push(`${col}=eq.${encodeURIComponent(val)}`); return this }
  neq(col, val) { this._filters.push(`${col}=neq.${encodeURIComponent(val)}`); return this }
  select(cols = '*') {
    if (!this._method) this._method = 'GET'
    this._params.set('select', cols)
    return this
  }
  order(col, { ascending = true } = {}) {
    this._params.append('order', `${col}.${ascending ? 'asc' : 'desc'}`)
    return this
  }
  limit(n) { this._params.set('limit', String(n)); return this }
  single() { this._singleRow = true; return this }
  maybeSingle() { this._maybeSingle = true; return this }

  async _execute() {
    const url = new URL(`${getBaseUrl()}/${this._table}`)
    const selectVal = this._params.get('select')
    if (selectVal) url.searchParams.set('select', selectVal)
    for (const f of this._filters) {
      const [col, rest] = f.split('=', 2)
      url.searchParams.append(col, rest)
    }
    const orders = this._params.getAll('order')
    for (const o of orders) url.searchParams.append('order', o)
    if (this._params.has('limit')) url.searchParams.set('limit', this._params.get('limit'))

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': getServiceKey(),
      'Authorization': `Bearer ${getServiceKey()}`,
    }
    if (this._method === 'PATCH' || this._method === 'POST') {
      headers['Prefer'] = 'return=representation'
    }

    try {
      const options = { method: this._method, headers }
      if (this._body) options.body = JSON.stringify(this._body)
      const response = await fetch(url.toString(), options)
      const body = response.ok ? await response.json().catch(() => null) : null

      if (!response.ok) {
        let detail
        try { const e = await response.clone().json(); detail = e.message || e.details || response.statusText }
        catch { detail = response.statusText }
        return { data: null, error: new Error(`PostgREST ${response.status}: ${detail}`) }
      }

      if (this._singleRow) {
        if (Array.isArray(body) && body.length > 0) return { data: body[0], error: null }
        return { data: null, error: new Error('No rows found') }
      }
      if (this._maybeSingle) {
        if (Array.isArray(body) && body.length > 0) return { data: body[0], error: null }
        return { data: null, error: null }
      }
      return { data: body || [], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }
}

class DbClient {
  from(table) { return new QueryBuilder(table) }
  async rpc(name, params = {}) {
    const url = `${getBaseUrl()}/rpc/${name}`
    const headers = {
      'Content-Type': 'application/json', 'Accept': 'application/json',
      'apikey': getServiceKey(), 'Authorization': `Bearer ${getServiceKey()}`,
    }
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
      const body = response.ok ? await response.json().catch(() => null) : null
      if (!response.ok) {
        let detail
        try { const e = await response.clone().json(); detail = e.message || e.details || response.statusText }
        catch { detail = response.statusText }
        return { data: null, error: new Error(`PostgREST ${response.status}: ${detail}`) }
      }
      return { data: body, error: null }
    } catch (err) { return { data: null, error: err } }
  }
}

export const db = new DbClient()

// Auth client (direct to GoTrue, bypasses Kong)
const authUrl = process.env.GOTRUE_URL || 'http://172.19.0.8:9999'
const anonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(process.env.SUPABASE_URL || '', anonKey, {
  auth: { autoRefreshToken: true, persistSession: false }
})

// Supabase auth client for direct GoTrue
class DirectAuth {
  async getUser(jwt) {
    try {
      const response = await fetch(`${authUrl}/user`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${jwt}` }
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        return { data: { user: null }, error: new Error(err.msg || 'Auth failed') }
      }
      const user = await response.json()
      return { data: { user }, error: null }
    } catch (err) { return { data: { user: null }, error: err } }
  }
}

export const supabaseAuth = new DirectAuth()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(helmet())
app.use(cors({
  origin: (process.env.CORS_ORIGINS || '').split(','),
  credentials: true,
}))

// Stripe webhook needs raw body
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (userId) {
          // Handle subscription
          if (session.mode === 'subscription') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription)
            // Update user to subscribed
            await db.from('users').update({
              is_subscribed: true,
              subscription_plan: session.metadata?.plan,
              updated_at: new Date().toISOString()
            }).eq('id', userId)
          } else {
            // One-time credit purchase
            const credits = parseInt(session.metadata?.credits || '0')
            if (credits > 0) {
              await db.rpc('add_credits', { p_user_id: userId, p_credits: credits })
            }
          }

          await db.from('purchases').insert({
            user_id: userId,
            stripe_session_id: session.id,
            credits: parseInt(session.metadata?.credits || '0') || 0,
            amount: session.amount_total / 100,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        // Find user by customer ID and remove subscription
        // For now, just log
        console.log('Subscription deleted:', subscription.id)
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

// Parse JSON for other routes
app.use(express.json())

// ======================
// Routes
// ======================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'videosnap-backend', timestamp: new Date().toISOString() })
})

// Auth middleware
import { requireAuth } from './middleware/auth.js'

// Video routes
import { videoRoutes } from './routes/video.js'
app.use('/api/video', videoRoutes)

// Credit routes
import { creditRoutes } from './routes/credits.js'
app.use('/api/credits', creditRoutes)

// Stripe checkout
app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body
    const userId = req.user.id

    const plans = {
      monthly: { price: 14.99, priceId: 'price_monthly', name: 'VideoSnap Monthly' },
      pro: { price: 44.99, priceId: 'price_pro', name: 'VideoSnap Pro' },
    }

    const selectedPlan = plans[plan] || plans.monthly

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: selectedPlan.name },
          unit_amount: Math.round(selectedPlan.price * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        userId,
        plan,
      },
      success_url: successUrl || `${process.env.APP_URL || 'http://localhost:3000'}/generate`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:3000'}/paywall`,
    })

    res.json({ url: session.url, sessionUrl: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Failed to create checkout session:', err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// Upload endpoint (for image upload to R2)
import multer from 'multer'
import { uploadImage } from './storage/r2.js'
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const buffer = req.file.buffer
    const ext = req.file.originalname.split('.').pop() || 'jpg'
    const contentType = req.file.mimetype || 'image/jpeg'
    const key = `videosnap/uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const url = await uploadImage(key, Buffer.from(buffer), contentType)
    res.json({ url, key })
  } catch (err) {
    console.error('Upload error:', err.message)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ VideoSnap backend running on port ${PORT}`)
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`)
})
