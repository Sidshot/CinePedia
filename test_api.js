const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000, // Assuming default port
    path: '/api/movies/test_id/rate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        if (res.statusCode === 404) {
            console.log('❌ 404 Not Found: The server does not recognize this endpoint yet.');
            console.log('👉 SOLUTION: Restart the server to load the new code.');
        } else if (res.statusCode === 200 || res.statusCode === 500) {
            // 500 might happen if ID is invalid, but at least the endpoint exists
            console.log('✅ Endpoint exists (Server is updated).');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(JSON.stringify({ value: 5 }));
req.end();
