
const http = require('http');

// First login to get a token
const loginData = JSON.stringify({
    email: 'test@example.com',
    name: 'Test User'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/dev/dev-login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

console.log('Step 1: Getting auth token...');

const loginReq = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const loginResponse = JSON.parse(body);
            const token = loginResponse.accessToken;
            console.log('✅ Got token');

            // Now test the respond endpoint
            console.log('\nStep 2: Testing /partners/respond endpoint...');

            const respondData = JSON.stringify({
                requestId: 'test-request-id',
                accept: true
            });

            const respondOptions = {
                hostname: 'localhost',
                port: 3001,
                path: '/api/v1/partners/respond',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Length': respondData.length
                }
            };

            const respondReq = http.request(respondOptions, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    console.log('Status:', res.statusCode);
                    console.log('Response:', body);

                    if (res.statusCode === 200) {
                        console.log('\n✅ Endpoint works!');
                    } else {
                        console.log('\n❌ Endpoint returned error');
                    }
                });
            });

            respondReq.on('error', (error) => {
                console.error('Request error:', error.message);
            });

            respondReq.write(respondData);
            respondReq.end();
        }
    });
});

loginReq.on('error', (error) => {
    console.error('Login error:', error.message);
});

loginReq.write(loginData);
loginReq.end();
