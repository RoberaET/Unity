
const http = require('http');

console.log('Step 1: Resetting test user...');

// First reset the test user
const resetOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/dev/reset-test-user',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
};

const resetReq = http.request(resetOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Reset Status:', res.statusCode);
        console.log('Reset Response:', body);

        if (res.statusCode === 200) {
            console.log('\n✅ User reset successful!\n');
            console.log('Step 2: Testing dev login...');

            // Now test dev login
            const loginOptions = {
                hostname: 'localhost',
                port: 3001,
                path: '/api/v1/dev/dev-login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };

            const loginReq = http.request(loginOptions, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    console.log('Login Status:', res.statusCode);
                    console.log('Login Response:', body.substring(0, 200));

                    if (res.statusCode === 200) {
                        console.log('\n✅ DEV LOGIN SUCCESSFUL!');
                        console.log('\n🎉 You can now use the frontend with these credentials:');
                        console.log('   Email: rebika4553@liorashop.com');
                        console.log('   Password: butela');
                    }
                });
            });

            loginReq.end();
        }
    });
});

resetReq.on('error', (error) => {
    console.error('Error:', error.message);
});

resetReq.end();
