const fs = require('fs');

const DB_FILE = 'data/cinepedia.data.json';

if (!fs.existsSync(DB_FILE)) {
    console.error('❌ Database file not found.');
    process.exit(1);
}

const dbFilms = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log(`🔍 Checking ${dbFilms.length} films for missing Letterboxd links...`);

let fixedCount = 0;

dbFilms.forEach(f => {
    // Check if LB link is missing or empty
    if (!f.lb || f.lb.trim() === '') {
        if (f.title) {
            // Generate Search Link
            const query = encodeURIComponent(f.title + ' ' + (f.year || ''));
            f.lb = `https://letterboxd.com/search/${query}`;
            fixedCount++;
        }
    }
});

if (fixedCount > 0) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbFilms, null, 2));
    console.log(`✅ Fixed! Generated fallback links for ${fixedCount} films.`);
} else {
    console.log('✨ All films already have Letterboxd links.');
}
