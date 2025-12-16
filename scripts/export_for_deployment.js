const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const config = require('../config');
const fs = require('fs');
const path = require('path');

async function exportData() {
    console.log('🚀 Exporting Data for Static Deployment...');

    try {
        // Force Localhost for this export script
        await mongoose.connect('mongodb://localhost:27017/cinepedia');
        console.log('✅ Connected to Local DB (Hardcoded)');

        const movies = await Movie.find({})
            .sort({ addedAt: -1 })
            .lean();

        console.log(`📊 Found ${movies.length} movies.`);

        // Sanitize for JSON (ObjectId to String, Date to ISO)
        const sanitized = movies.map(doc => {
            const d = { ...doc };
            if (d._id) d._id = d._id.toString();
            if (d.addedAt) d.addedAt = d.addedAt.toISOString();
            return d;
        });

        const outputPath = path.join(__dirname, '../cineamore-next/lib/movies.json');

        fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2));
        console.log(`✅ Saved to ${outputPath}`);

        await mongoose.disconnect();

    } catch (err) {
        console.error('❌ Export Failed:', err);
    }
}

exportData();
