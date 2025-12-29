
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
    console.log('🧪 Testing complete partner flow...\n');

    // Step 1: Create/login user 1
    console.log('Step 1: Creating user Alice...');
    const alice = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/dev/dev-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'alice@test.com', name: 'Alice' });

    console.log(`✅ Alice logged in (${alice.status})`);
    const aliceToken = alice.data.accessToken;

    // Step 2: Create/login user 2
    console.log('\nStep 2: Creating user Bob...');
    const bob = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/dev/dev-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'bob@test.com', name: 'Bob' });

    console.log(`✅ Bob logged in (${bob.status})`);
    const bobToken = bob.data.accessToken;

    // Step 3: Alice sends request to Bob
    console.log('\nStep 3: Alice sending partner request to Bob...');
    const sendRequest = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/partners/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aliceToken}`
        }
    }, { email: 'bob@test.com' });

    console.log(`Response: ${sendRequest.status}`);
    console.log('Data:', JSON.stringify(sendRequest.data, null, 2));

    if (sendRequest.status !== 200 && sendRequest.status !== 201) {
        console.log('\n❌ FAILED TO SEND REQUEST');
        console.log('This is the problem!');
        return;
    }

    console.log('✅ Request sent successfully');

    // Step 4: Bob checks his requests
    console.log('\nStep 4: Bob checking incoming requests...');
    const bobRequests = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/partners/requests',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${bobToken}` }
    });

    console.log(`Response: ${bobRequests.status}`);
    console.log('Requests:', JSON.stringify(bobRequests.data, null, 2));

    const receivedRequests = bobRequests.data.received || [];
    if (receivedRequests.length === 0) {
        console.log('\n❌ NO REQUESTS FOUND');
        return;
    }

    const requestId = receivedRequests[0].id;
    console.log(`✅ Found request ID: ${requestId}`);

    // Step 5: Bob accepts the request
    console.log('\nStep 5: Bob accepting the request...');
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

    console.log(`Response: ${accept.status}`);
    console.log('Data:', JSON.stringify(accept.data, null, 2));

    if (accept.status === 200) {
        console.log('\n✅ ACCEPT WORKED!');
    } else {
        console.log('\n❌ ACCEPT FAILED');
        console.log('This is the problem!');
    }
}

testPartnerFlow().catch(console.error);
