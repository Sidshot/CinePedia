const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('d:\\CinePedia - IDL\\CinePedia\\index.html', 'utf8');
const match = html.match(/const DATA = (\[[\s\S]*?\]);/);

if (match && match[1]) {
    try {
        const rawData = JSON.parse(match[1]);
        console.log(`Found ${rawData.length} items in index.html`);

        // Normalization helper (mirrors app.js logic)
        const normalize = (obj) => {
            const g = (k, ...alts) => {
                for (const key of [k, ...alts]) {
                    if (obj[key] != null && String(obj[key]).trim() !== '') return String(obj[key]).trim();
                }
                return '';
            };
            const title = g('title', 'Title', 'Título', 'Titulo');
            const original = g('original', 'Original Title', 'Título Original', 'Titulo Original');
            const director = g('director', 'Director', 'Diretor');
            const yearStr = g('year', 'Year', 'Ano');
            const lb = g('lb', 'letterboxd', 'Letterboxd', 'Letterboxd Link', 'Link do Letterboxd');
            const drive = g('drive', 'Drive', 'Drive Link', 'Link do Drive');
            const dl = g('dl', 'download', 'Download', 'Download Link', 'Link de Download');
            const notes = g('notes', 'Notes', 'Notas');

            const year = yearStr ? (parseInt(yearStr, 10) || null) : null;
            return { title, original, year, director, lb, drive, dl, notes };
        };

        const newData = rawData.map(normalize);
        const targetPath = path.join('d:\\CinePedia - IDL\\CinePedia\\data', 'cinepedia.data.json');

        fs.writeFileSync(targetPath, JSON.stringify(newData, null, 2), 'utf8');
        console.log(`Successfully migrated ${newData.length} items to cinepedia.data.json`);

    } catch (e) {
        console.error('Error migrating data:', e);
    }
} else {
    console.log('Could not find DATA in index.html to migrate.');
}
