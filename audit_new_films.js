const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('films_raw.json', 'utf8'));

console.log(`📊 Auditing ${rawData.length} new films...`);

let missing = {
    download: 0,
    director: 0,
    year: 0,
    letterboxd: 0
};

rawData.forEach(f => {
    if (!f['Download Link']) missing.download++;
    if (!f['Director']) missing.director++;
    if (!f['Film Year']) missing.year++;
    // Check if source even HAS Letterboxd column
    if (!f['Letterboxd Link'] && !f['Letterboxd']) missing.letterboxd++;
});

console.log('--------------------------------------------------');
console.log(`❌ Missing Download Link: ${missing.download}`);
console.log(`❌ Missing Director:      ${missing.director}`);
console.log(`❌ Missing Year:          ${missing.year}`);
console.log(`❌ Missing Letterboxd:    ${missing.letterboxd} (likely 100%)`);
console.log('--------------------------------------------------');

// Check actual column names
console.log('Found Columns:', Object.keys(rawData[0]));
