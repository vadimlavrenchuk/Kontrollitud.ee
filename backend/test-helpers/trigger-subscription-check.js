// Trigger subscription check manually
// Run from backend directory: node test-helpers/trigger-subscription-check.js

const axios = require('axios');

async function triggerCheck() {
    try {
        console.log('🧪 Triggering subscription check via API...');
        const response = await axios.get('http://localhost:5000/api/admin/test-subscription-check');
        console.log('✅ Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

triggerCheck();
