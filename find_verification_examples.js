const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

console.log('--- 🧪 VERIFICATION LIST ---\n');

// 1. Multi-Link Films
const multi = db.filter(f => f.downloadLinks && f.downloadLinks.length > 1).slice(0, 5);
console.log('📂 **Films with Multiple Download Options:**');
multi.forEach(f => {
    console.log(`- ${f.title} (${f.year}): ${f.downloadLinks.length} Links`);
});
console.log('');

// 2. New Films (Likely 2024/2025 matches from import)
const recent = db.filter(f =>
    (f.year === 2024 || f.year === 2025) &&
    f.downloadLinks &&
    f.downloadLinks.some(l => l.url.includes('transfer.it'))
).slice(0, 5);

console.log('🆕 **New Films (2024-2025) with transfer.it links:**');
recent.forEach(f => {
    console.log(`- ${f.title} (${f.year})`);
});
console.log('');

// 3. Random Check (Older films)
const older = db.filter(f =>
    f.year < 2000 &&
    f.downloadLinks &&
    f.downloadLinks.some(l => l.url.includes('transfer.it'))
).slice(0, 5);

console.log('🎞️ **Older Films with New Links:**');
older.forEach(f => {
    console.log(`- ${f.title} (${f.year})`);
});
