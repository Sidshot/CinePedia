const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/const DATA = (\[[\s\S]*?\]);/);

if (match && match[1]) {
    try {
        const data = JSON.parse(match[1]);
        console.log(`Found ${data.length} items in index.html`);

        // Check current json file
        const currentPath = path.join('data', 'cinepedia.data.json');
        let currentCount = 0;
        if (fs.existsSync(currentPath)) {
            const currentData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
            currentCount = currentData.length;
            console.log(`Current JSON file has ${currentCount} items`);
        }

        if (data.length > currentCount) {
            console.log('Index.html has more data. Ready to migrate.');
        } else {
            console.log('Index.html does not have more data.');
        }

    } catch (e) {
        console.error('Error parsing DATA from index.html:', e);
    }
} else {
    console.log('Could not find DATA constant in index.html');
}
