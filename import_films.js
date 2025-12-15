const fs = require('fs');
const http = require('http');

const rawData = JSON.parse(fs.readFileSync('films_raw.json', 'utf8'));

// Map to API format
const imports = rawData.map(f => ({
    title: f['Film Title'],
    year: f['Film Year'],
    director: f['Director'],
    download: f['Download Link'],
    // Notes: f['Notes'] // API might not support notes yet, checking schema...
}));

console.log(`🚀 Preparing to import ${imports.length} films...`);

const postData = JSON.stringify(imports);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/import',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-admin-pass': '2025' // Using default dev password for local import
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
