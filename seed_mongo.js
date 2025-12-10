require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Movie = require('./models/Movie');

// usage: node seed_mongo.js <MONGO_URI>
// or set MONGO_URI in .env

const URI = process.argv[2] || process.env.MONGO_URI;

if (!URI) {
    console.error('❌ Please provide a MongoDB URI.');
    console.error('Usage: node seed_mongo.js "mongodb+srv://..."');
    process.exit(1);
}

const DATA_PATH = path.join(__dirname, 'data', 'cinepedia.data.json');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(URI);
        console.log('✅ Connected.');

        console.log('Reading local data...');
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        const movies = JSON.parse(raw);
        console.log(`Found ${movies.length} movies in local file.`);

        console.log('Clearing existing database (optional check)...');
        // await Movie.deleteMany({}); // Uncomment if you want to wipe DB first

        console.log('Seeding data...');
        // Ensure IDs exist
        const prep = movies.map(m => {
            if (!m.__id) {
                // basic hash
                const fp = (m.title + m.year).toLowerCase();
                m.__id = 'seed_' + Math.random().toString(36).substr(2, 9);
            }
            return m;
        });

        // Insert in chunks to avoid timeout
        const CHUNK_SIZE = 500;
        for (let i = 0; i < prep.length; i += CHUNK_SIZE) {
            const chunk = prep.slice(i, i + CHUNK_SIZE);
            try {
                await Movie.insertMany(chunk, { ordered: false });
                console.log(`  Inserted ${i + chunk.length} / ${prep.length}`);
            } catch (e) {
                console.warn(`  ⚠️ Chunk warning (likely duplicates):`, e.message.split('\n')[0]);
            }
        }

        console.log('✅ Seeding Complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seed();
