#!/usr/bin/env node

/**
 * Script to create PolyEdge Pro product in Stripe
 * 
 * Usage: node create-stripe-product.js
 * 
 * Requires STRIPE_SECRET_KEY environment variable
 * Get this from: https://dashboard.stripe.com/apikeys
 */

const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: '.env' });

const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in .env file');
  console.error('Please add your Stripe secret key to .env file:');
  console.error('EXPO_PUBLIC_STRIPE_SECRET_KEY=sk_live_...');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function createPolyEdgeProduct() {
  console.log('🚀 Creating PolyEdge Pro product in Stripe...');
  
  try {
    // Create the product
    const product = await stripe.products.create({
      name: 'PolyEdge Pro',
      description: 'Premium subscription for PolyEdge - Polymarket analytics app',
      metadata: {
        app: 'PolyEdge',
        type: 'subscription',
      },
    });
    
    console.log('✅ Product created:', product.id);
    
    // Create monthly price (€9.99/month)
    const monthlyPrice = await stripe.prices.create({
      unit_amount: 999, // €9.99 in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      product: product.id,
      metadata: {
        plan: 'pro_monthly',
        interval: 'monthly',
      },
    });
    
    console.log('✅ Monthly price created:', monthlyPrice.id);
    console.log('   Price ID for monthly: ', monthlyPrice.id);
    console.log('   Amount: €9.99/month');
    
    // Create yearly price (€79.99/year)
    const yearlyPrice = await stripe.prices.create({
      unit_amount: 7999, // €79.99 in cents
      currency: 'eur',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      product: product.id,
      metadata: {
        plan: 'pro_yearly',
        interval: 'yearly',
      },
    });
    
    console.log('✅ Yearly price created:', yearlyPrice.id);
    console.log('   Price ID for yearly: ', yearlyPrice.id);
    console.log('   Amount: €79.99/year');
    
    // Update the .env file with the new price IDs
    const fs = require('fs');
    const envPath = '.env';
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the Stripe service with the new price IDs
    const stripeServicePath = 'services/stripe.ts';
    let stripeServiceContent = fs.readFileSync(stripeServicePath, 'utf8');
    
    // Replace placeholder price IDs
    stripeServiceContent = stripeServiceContent.replace(
      /PRODUCT_IDS = \{[^}]+?\}/s,
      `PRODUCT_IDS = {\n  PRO_MONTHLY: '${monthlyPrice.id}', // €9.99/month\n  PRO_YEARLY: '${yearlyPrice.id}',   // €79.99/year\n}`
    );
    
    fs.writeFileSync(stripeServicePath, stripeServiceContent, 'utf8');
    console.log('✅ Updated services/stripe.ts with new price IDs');
    
    console.log('\n🎉 PolyEdge Pro product created successfully!');
    console.log('\n📋 Price IDs to copy:');
    console.log('Monthly (€9.99/month):', monthlyPrice.id);
    console.log('Yearly (€79.99/year):', yearlyPrice.id);
    console.log('\n🔗 View in Stripe Dashboard:');
    console.log(`https://dashboard.stripe.com/products/${product.id}`);
    
  } catch (error) {
    console.error('❌ Error creating Stripe product:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Please check your Stripe secret key is correct');
    }
    process.exit(1);
  }
}

createPolyEdgeProduct();