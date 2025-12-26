// Configuration from .env
const VIETQR_SYSTEM_USERNAME = "customer-nerd-user25466";
const VIETQR_SYSTEM_PASSWORD = "Y3VzdG9tZXItbmVyZC11c2VyMjU0NjY=";

// VietQR Dev APIs
const VQR_DEV_TOKEN_URL = "https://dev.vietqr.org/vqr/api/token_generate";
const VQR_DEV_CALLBACK_TRIGGER_URL = "https://dev.vietqr.org/vqr/bank/api/test/transaction-callback";

// Payment Info (matches your .env)
const MY_BANK_CODE = "MB";
const MY_BANK_ACCOUNT = "0904521145";

async function triggerVietQRTest() {
    console.log('🚀 Starting VietQR Test Callback Trigger...\n');

    // 1. Get Token from VietQR System (To allow us to call THEIR test API)
    console.log('1️⃣  Step 1: Authenticating with VietQR Dev System...');

    // Auth Basic for VietQR API
    const credentials = Buffer.from(`${VIETQR_SYSTEM_USERNAME}:${VIETQR_SYSTEM_PASSWORD}`).toString('base64');

    try {
        const tokenResponse = await fetch(VQR_DEV_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        const tokenData = await tokenResponse.json();
        console.log('Response Status:', tokenResponse.status);

        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error('❌ Failed to get access token from VietQR.');
            console.error('Response:', tokenData);
            return;
        }

        const accessToken = tokenData.access_token;
        console.log('✅ Got VietQR System Token.\n');

        // 2. Trigger the Test Callback
        console.log('2️⃣  Step 2: Requesting Test Callback...');

        const payload = {
            bankAccount: MY_BANK_ACCOUNT,
            bankCode: MY_BANK_CODE,
            amount: "100000",
            content: "VQR6e1f550bdd NERD 20251226 001", // Format: VQR[mã] NERD [ngày] [số thứ tự]
            transType: "C"
        };

        console.log('Sending Payload:', payload);

        const triggerResponse = await fetch(VQR_DEV_CALLBACK_TRIGGER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        });

        const triggerData = await triggerResponse.json();
        console.log('Response Status:', triggerResponse.status);
        console.log('Response Body:', triggerData);

        if (triggerResponse.ok && triggerData.status === 'SUCCESS') {
            console.log('\n✅ Call Success! VietQR is now sending the webhook to your Public IP.');
            console.log('👉 Please check your "npm run dev" terminal to see the incoming request.');
        } else {
            console.warn('\n⚠️ Call Failed or returned error status.');
        }

    } catch (error) {
        console.error('❌ Error execution:', error);
    }
}

triggerVietQRTest();
