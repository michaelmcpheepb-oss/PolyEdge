// Direct test with Bearer token
const https = require('https');

const options = {
  hostname: 'utbkvjgatqiibfkcpugc.supabase.co',
  path: '/rest/v1/markets?select=*&limit=1',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_cmcEdgtywOGznXS5mQ4Bow_q_aTlZhe',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Ymt2amdhdHFpaWJma2NwdWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MjU2MCwiZXhwIjoyMDkyMzM4NTYwfQ.ztUYEVHHd7PPi_MHo6l7j142ESle2TfulBR1GxNLLT4',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
};

console.log('Testing with Bearer token...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Success!');
      const result = JSON.parse(data);
      console.log('Data:', result);
    } else {
      console.log('❌ Failed with status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();