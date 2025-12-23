/**
 * Verify the import by checking updated films in MongoDB
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:mongoadmin@cluster0.lallguq.mongodb.net/cinepedia?retryWrites=true&w=majority&appName=Cluster0';

const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema);

async function verifyImport() {
    console.log('🔍 Verifying Import...\n');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Check total quarantined films
        const totalQuarantined = await Movie.countDocuments({ 'visibility.state': 'quarantined' });
        console.log(`📊 Total quarantined films: ${totalQuarantined}\n`);

        // Check how many have TMDB data
        const withTMDB = await Movie.countDocuments({
            'visibility.state': 'quarantined',
            tmdbId: { $exists: true, $ne: null }
        });
        console.log(`✅ Films with TMDB data: ${withTMDB} (${(withTMDB / totalQuarantined * 100).toFixed(1)}%)\n`);

        // Get sample enriched films
        console.log('📽️  Sample enriched films:\n');
        const samples = await Movie.find({
            'visibility.state': 'quarantined',
            tmdbId: { $exists: true }
        })
            .select('title year director plot genre posterUrl rating tmdbId')
            .limit(5)
            .lean();

        samples.forEach((film, i) => {
            console.log(`${i + 1}. ${film.title} (${film.year || 'N/A'})`);
            console.log(`   Director: ${film.director || 'N/A'}`);
            console.log(`   Genres: ${film.genre?.join(', ') || 'N/A'}`);
            console.log(`   TMDB ID: ${film.tmdbId}`);
            console.log(`   Rating: ${film.rating || 'N/A'}`);
            console.log(`   Has plot: ${film.plot ? 'Yes' : 'No'}`);
            console.log(`   Has poster: ${film.posterUrl ? 'Yes' : 'No'}\n`);
        });

        // Check films without TMDB
        const withoutTMDB = await Movie.find({
            'visibility.state': 'quarantined',
            tmdbId: { $exists: false }
        })
            .select('title year director')
            .limit(5)
            .lean();

        console.log('⚠️  Sample non-enriched films:\n');
        withoutTMDB.forEach((film, i) => {
            console.log(`${i + 1}. ${film.title} (${film.year || 'N/A'}) - ${film.director || 'Unknown'}`);
        });

        console.log(`\n${'='.repeat(60)}`);
        console.log('✅ Verification complete!');
        console.log(`   Total: ${totalQuarantined}`);
        console.log(`   With TMDB: ${withTMDB} (${(withTMDB / totalQuarantined * 100).toFixed(1)}%)`);
        console.log(`   Without TMDB: ${totalQuarantined - withTMDB} (${((totalQuarantined - withTMDB) / totalQuarantined * 100).toFixed(1)}%)\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyImport();
