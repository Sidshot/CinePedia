import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing');
    process.exit(1);
}

const MovieSchema = new mongoose.Schema({
    title: String,
    dl: String,
    drive: String,
    downloadLinks: Array
}, { strict: false });

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

async function checkLegacyData() {
    console.log('Connecting to DB...');
    await mongoose.connect(MONGODB_URI);

    const total = await Movie.countDocuments();
    const withDl = await Movie.countDocuments({ dl: { $exists: true, $ne: '' } });
    const withDrive = await Movie.countDocuments({ drive: { $exists: true, $ne: '' } });
    const withNewLinks = await Movie.countDocuments({ downloadLinks: { $exists: true, $not: { $size: 0 } } });

    // Mixed usage (Has legacy AND new)
    const mixed = await Movie.countDocuments({
        $or: [{ dl: { $exists: true, $ne: '' } }, { drive: { $exists: true, $ne: '' } }],
        downloadLinks: { $exists: true, $not: { $size: 0 } }
    });

    console.log(`
📊 Database Stats:
------------------
Total Movies: ${total}

Legacy Fields:
- 'dl' field:    ${withDl}
- 'drive' field: ${withDrive}

New System:
- 'downloadLinks': ${withNewLinks}

⚠️ Mixed Usage (Risk of data loss): ${mixed}
    `);

    await mongoose.disconnect();
}

checkLegacyData();
