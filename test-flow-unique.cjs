
const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testPartnerFlow() {
    const timestamp = Date.now();
    const aliceEmail = `alice${timestamp}@test.com`;
    const bobEmail = `bob${timestamp}@test.com`;

    console.log('🧪 Testing partner flow...\n');

    // Step 1: Create Alice
    console.log('Step 1: Creating Alice...');
    const alice = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/dev/dev-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: aliceEmail, name: 'Alice' });

    console.log(`✅ Alice created`);
    const aliceToken = alice.data.accessToken;

    // Step 2: Create Bob
    console.log('\nStep 2: Creating Bob...');
    const bob = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/dev/dev-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: bobEmail, name: 'Bob' });

    console.log(`✅ Bob created`);
    const bobToken = bob.data.accessToken;

    // Step 3: Alice sends request to Bob
    console.log(`\nStep 3: Alice sending request to ${bobEmail}...`);
    const sendRequest = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/partners/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aliceToken}`
        }
    }, { email: bobEmail });

    console.log(`Status: ${sendRequest.status}`);
    if (sendRequest.status !== 200 && sendRequest.status !== 201) {
        console.log('❌ SEND FAILED:', JSON.stringify(sendRequest.data, null, 2));
        return;
    }
    console.log('✅ Request sent');

    // Step 4: Bob gets requests
    console.log('\nStep 4: Bob checking requests...');
    const requests = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/partners/requests',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });

    const receivedRequests = requests.data.received || [];
    if (receivedRequests.length === 0) {
        console.log('❌ NO REQUESTS');
        return;
    }

    const requestId = receivedRequests[0].id;
    console.log(`✅ Got request: ${requestId}`);

    // Step 5: Bob accepts
    console.log('\nStep 5: Bob accepting...');
    const accept = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/partners/respond',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bobToken}`
        }
    }, { requestId, accept: true });

    console.log(`Status: ${accept.status}`);
    console.log('Response:', JSON.stringify(accept.data, null, 2));

    if (accept.status === 200) {
        console.log('\n✅✅✅ SUCCESS! ACCEPT WORKS!');
    } else {
        console.log('\n❌❌❌ ACCEPT FAILED - Check backend logs above');
    }
}

testPartnerFlow().catch(console.error);
