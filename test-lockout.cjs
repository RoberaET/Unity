
const http = require('http');

// First, let's test if we can login now
const data = JSON.stringify({
    email: 'rebika4553@liorashop.com',
    password: 'butela'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing login after disabling lockout...');

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('✅ LOGIN SUCCESSFUL! Account lockout disabled.');
        } else {
            console.log(`❌ Login failed: ${body}`);
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.write(data);
req.end();
