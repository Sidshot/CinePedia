const fs = require('fs');
const path = require('path');

// Configuration
const JSON_PATH = path.join('data', 'cinepedia.data.json');
const CSV_DIR = '.'; // Current directory

// Quality Scoring
function getQualityScore(str) {
    let score = 0;
    if (!str) return 0;
    const s = str.toLowerCase();

    // Resolution
    if (s.includes('2160p') || s.includes('4k')) score += 10;
    else if (s.includes('1080p')) score += 5;
    else if (s.includes('720p')) score += 3;

    // Source
    if (s.includes('bluray') || s.includes('remux')) score += 2;
    else if (s.includes('webrip') || s.includes('web-dl')) score += 1;

    // Codec
    if (s.includes('x265') || s.includes('hevc')) score += 1;

    // Link vs Filename preference?
    // User wants "higher quality", usually found in filenames.
    // Real HTTP links are valuable too. Let's give a small boost to http to break ties if no quality info?
    // Actually, if a user has a filename "Movie.1080p.mkv" vs a link "drive.google.com/...", strict "size/quality" logic implies the mkv info is more detailed.
    // However, a playable link is functionally better for a web app. 
    // BUT the user explicitly asked to import these CSVs which HAVE filenames. 
    // They likely want these filenames cataloged.

    return score;
}

// Data Normalization
function normalize(row) {
    // Expected CSV Cols (0-based): 
    // 0: Titre, 1: Titre original, 2: Année, 3: Réalisateur/trice, 5: Lien Drive
    const title = row[0] ? row[0].trim() : '';
    const original = row[1] ? row[1].trim() : '';
    const year = row[2] ? parseInt(row[2], 10) : null;
    const director = row[3] ? row[3].trim() : '';
    const drive = row[5] ? row[5].trim() : ''; // This is the "Link" or Filename

    return {
        title,
        original,
        year,
        director,
        lb: '',
        drive,
        dl: '',
        notes: ''
    };
}

// CSV Parser handling quotes
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const rows = [];

    for (const line of lines) {
        if (!line.trim()) continue;
        const row = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuote && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (char === ',' && !inQuote) {
                row.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        row.push(current);
        rows.push(row);
    }
    return rows;
}

// Main logic
try {
    // 1. Load Existing JSON
    let movieMap = new Map(); // Key: "title|year" -> Object

    if (fs.existsSync(JSON_PATH)) {
        const existingData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
        existingData.forEach(m => {
            const key = `${m.title.toLowerCase().trim()}|${m.year}`;
            movieMap.set(key, m);
        });
        console.log(`Loaded ${existingData.length} existing items.`);
    }

    // 2. Load CSVs
    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    console.log(`Found ${files.length} CSV files: ${files.join(', ')}`);

    for (const file of files) {
        const content = fs.readFileSync(path.join(CSV_DIR, file), 'utf8');
        const rows = parseCSV(content);

        // Skip header (Assume 1st row if starts with Titre)
        const startIndex = (rows[0] && rows[0][0].startsWith('Titre')) ? 1 : 0;

        for (let i = startIndex; i < rows.length; i++) {
            const item = normalize(rows[i]);
            if (!item.title) continue;

            const key = `${item.title.toLowerCase().trim()}|${item.year}`;

            if (movieMap.has(key)) {
                // Deduplicate / Merge
                const existing = movieMap.get(key);
                const scoreExisting = getQualityScore(existing.drive);
                const scoreNew = getQualityScore(item.drive);

                // User: "keep the latest file (try to see if the latest film is of higher quality...)"
                // If new has better score, replace.
                // If same score, maybe prefer the one with more metadata?
                // Or just prefer the new one (as "latest file")?
                if (scoreNew > scoreExisting) {
                    // Update fields but preserve notes/lb if existing has them and new doesn't
                    movieMap.set(key, { ...existing, ...item, lb: existing.lb || item.lb, notes: existing.notes || item.notes });
                } else {
                    // Keep existing, but maybe fill missing gaps?
                    if (!existing.original && item.original) existing.original = item.original;
                    if (!existing.director && item.director) existing.director = item.director;
                }
            } else {
                // New Item
                movieMap.set(key, item);
            }
        }
    }

    // 3. Write Output
    const finalData = Array.from(movieMap.values());
    fs.writeFileSync(JSON_PATH, JSON.stringify(finalData, null, 2));
    console.log(`Import complete. Total items: ${finalData.length}`);

} catch (err) {
    console.error('Error during import:', err);
}
