// Direct test without Supabase JS client
const https = require('https');

const options = {
  hostname: 'utbkvjgatqiibfkcpugc.supabase.co',
  path: '/rest/v1/markets?select=*&limit=1',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_cmcEdgtywOGznXS5mQ4Bow_q_aTlZhe',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
};

console.log('Testing direct REST API call...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Success! Table is accessible.');
    } else {
      console.log('❌ Failed with status:', res.statusCode);
      console.log('Response body:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();