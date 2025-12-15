const fs = require('fs');
const https = require('https');
const http = require('http');

const rawData = JSON.parse(fs.readFileSync('films_raw.json', 'utf8'));

const checkLink = (url) => {
    return new Promise((resolve) => {
        if (!url) return resolve({ valid: false, status: 'MISSING' });

        const client = url.startsWith('https') ? https : http;
        const req = client.request(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            resolve({ valid: res.statusCode < 400, status: res.statusCode });
        });

        req.on('error', (e) => {
            resolve({ valid: false, status: 'ERROR' });
        });

        req.end();
    });
};

const processFilms = async () => {
    console.log(`🔍 Validating ${rawData.length} links...`);
    const results = [];

    // Process in chunks to avoid rate limits
    const CHUNK_SIZE = 10;
    for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
        const chunk = rawData.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map(async (f) => {
            const link = f['Download Link']; // Updated column name
            const validation = await checkLink(link);

            return {
                title: f['Film Title'],
                year: f['Film Year'],
                director: f['Director'],
                download: link, // Mapping X link to download
                validation: validation
            };
        });

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
        process.stdout.write(`\rProcessed ${Math.min(i + CHUNK_SIZE, rawData.length)}/${rawData.length}`);
    }

    console.log('\n✅ Validation Complete.');
    const validCount = results.filter(r => r.validation.valid).length;
    const missingCount = results.filter(r => r.validation.status === 'MISSING').length;
    const deadCount = results.length - validCount - missingCount;

    console.log(`📊 Statistics:`);
    console.log(`   Valid: ${validCount}`);
    console.log(`   Missing: ${missingCount}`);
    console.log(`   Dead/Error: ${deadCount}`);

    fs.writeFileSync('films_validated.json', JSON.stringify(results, null, 2));
};

processFilms();
