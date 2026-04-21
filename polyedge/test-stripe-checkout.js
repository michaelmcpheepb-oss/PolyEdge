// Test Stripe checkout URL generation
console.log('Testing Stripe checkout URL generation...\n');

// Test price IDs
const WEEKLY_PRICE_ID = 'price_1TOfxD2F8prHOW8KHwDF8vQB';
const MONTHLY_PRICE_ID = 'price_1TOfvW2F8prHOW8KRP72v1Zu';

// Test user ID
const USER_ID = 'user_test_123';
const EMAIL = 'test@example.com';

// Generate checkout URLs
function generateCheckoutUrl(priceId, userId, email) {
  const params = new URLSearchParams({
    'client_reference_id': userId,
    'prefilled_email': email || '',
    'success_url': 'polyedge://payment-success',
    'cancel_url': 'polyedge://payment-cancel',
  });
  
  return `https://checkout.stripe.com/c/pay/${priceId}?${params.toString()}`;
}

// Test weekly plan
const weeklyUrl = generateCheckoutUrl(WEEKLY_PRICE_ID, USER_ID, EMAIL);
console.log('📅 Weekly Plan (€2.50/week):');
console.log('Price ID:', WEEKLY_PRICE_ID);
console.log('Checkout URL:', weeklyUrl);
console.log('');

// Test monthly plan  
const monthlyUrl = generateCheckoutUrl(MONTHLY_PRICE_ID, USER_ID, EMAIL);
console.log('📅 Monthly Plan (€9.99/month):');
console.log('Price ID:', MONTHLY_PRICE_ID);
console.log('Checkout URL:', monthlyUrl);
console.log('');

// Test deep link handling
console.log('🔗 Deep Links:');
console.log('Success:', 'polyedge://payment-success');
console.log('Cancel:', 'polyedge://payment-cancel');
console.log('');

// Test card for Stripe test mode
console.log('💳 Test Card for Stripe Test Mode:');
console.log('Card Number: 4242 4242 4242 4242');
console.log('Expiry: Any future date (e.g., 12/34)');
console.log('CVC: Any 3 digits (e.g., 123)');
console.log('ZIP: Any 5 digits (e.g., 12345)');
console.log('');

console.log('✅ Stripe checkout test complete!');