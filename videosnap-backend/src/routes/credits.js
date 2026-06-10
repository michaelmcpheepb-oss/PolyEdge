import { Router } from 'express'
import { db, stripe } from '../index.js'
import { requireAuth } from '../middleware/auth.js'

export const creditRoutes = Router()

// Get user's credits
creditRoutes.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await db
      .from('users')
      .select('credits, is_subscribed')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    res.json({
      credits: data?.credits || 0,
      isSubscribed: data?.is_subscribed || false,
    })
  } catch (err) {
    console.error('Failed to get credits:', err)
    res.status(500).json({ error: 'Failed to get credits' })
  }
})

// Buy credits (one-time)
creditRoutes.post('/buy', requireAuth, async (req, res) => {
  try {
    const { credits, amount } = req.body
    if (!credits || !amount) {
      return res.status(400).json({ error: 'credits and amount are required' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${credits} VideoSnap Credits` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      metadata: { userId: req.user.id, credits: credits.toString() },
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/generate`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/paywall`,
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Failed to create checkout:', err)
    res.status(500).json({ error: 'Failed to create checkout' })
  }
})
