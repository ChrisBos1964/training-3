import fetch from 'node-fetch';

async function testForgotPassword() {
  try {
    console.log('Testing forgot password endpoint...');
    
    const response = await fetch('http://localhost:3001/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'joel' }),
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Forgot password endpoint working correctly');
    } else {
      console.log('❌ Forgot password endpoint failed');
    }
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.message);
  }
}

testForgotPassword();
