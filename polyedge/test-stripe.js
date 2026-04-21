// Test Stripe connection
require('dotenv').config({ path: '.env' });

const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

console.log('Stripe key exists:', !!STRIPE_SECRET_KEY);
console.log('Key starts with:', STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'none');
console.log('Key is test mode:', STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.startsWith('sk_test_') : 'none');
console.log('Key is live mode:', STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.startsWith('sk_live_') : 'none');