/**
 * Unquarantine All Films - Make Them Public!
 * 
 * This script sets all quarantined films to visible state.
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:mongoadmin@cluster0.lallguq.mongodb.net/cinepedia?retryWrites=true&w=majority&appName=Cluster0';

const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema);

async function unquarantineAll() {
    console.log('🚀 Unquarantining All Films - Making Them Public!\n');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('   ✓ Connected\n');

        // Count current quarantined films
        const totalQuarantined = await Movie.countDocuments({ 'visibility.state': 'quarantined' });
        console.log(`📊 Films currently quarantined: ${totalQuarantined}\n`);

        if (totalQuarantined === 0) {
            console.log('✅ No quarantined films found. All films are already public!\n');
            return;
        }

        // Get a few examples before updating
        const examples = await Movie.find({ 'visibility.state': 'quarantined' })
            .select('title year tmdbId')
            .limit(5)
            .lean();

        console.log('📽️  Sample films to be made public:\n');
        examples.forEach((film, i) => {
            const tmdbStatus = film.tmdbId ? '✅ Has TMDB' : '⚠️  No TMDB';
            console.log(`   ${i + 1}. ${film.title} (${film.year || 'N/A'}) - ${tmdbStatus}`);
        });

        console.log(`\n⚠️  About to make ${totalQuarantined} films PUBLIC\n`);
        console.log('   This will:');
        console.log('   • Set visibility.state = "visible"');
        console.log('   • Clear visibility.reason');
        console.log('   • Update visibility.updatedAt\n');

        // Proceed with update
        console.log('🚀 Making films public...\n');

        const result = await Movie.updateMany(
            { 'visibility.state': 'quarantined' },
            {
                $set: {
                    'visibility.state': 'visible',
                    'visibility.reason': null,
                    'visibility.updatedAt': new Date()
                }
            }
        );

        console.log('='.repeat(60));
        console.log('✅ SUCCESS! Films are now public!\n');
        console.log(`📊 RESULTS:`);
        console.log(`   • Films updated: ${result.modifiedCount}`);
        console.log(`   • Matched: ${result.matchedCount}`);
        console.log(`   • Status: ${result.acknowledged ? 'Confirmed' : 'Pending'}\n`);

        // Verify
        const stillQuarantined = await Movie.countDocuments({ 'visibility.state': 'quarantined' });
        const nowVisible = await Movie.countDocuments({ 'visibility.state': 'visible' });

        console.log(`🔍 VERIFICATION:`);
        console.log(`   • Still quarantined: ${stillQuarantined}`);
        console.log(`   • Now visible: ${nowVisible}`);
        console.log(`   • With TMDB data: ${await Movie.countDocuments({ 'visibility.state': 'visible', tmdbId: { $exists: true } })}\n`);

        console.log('='.repeat(60));
        console.log('🎉 ALL DONE!\n');
        console.log('Your films are now live on CineAmore!');
        console.log('Visit http://localhost:3000 to see them.\n');

        // Get some stats on the newly public films
        const withTMDB = await Movie.countDocuments({
            'visibility.state': 'visible',
            tmdbId: { $exists: true, $ne: null }
        });

        console.log('📊 FINAL STATS:');
        console.log(`   • Total public films: ${nowVisible}`);
        console.log(`   • With full TMDB metadata: ${withTMDB} (${(withTMDB / nowVisible * 100).toFixed(1)}%)`);
        console.log(`   • Ready for browsing! 🎬\n`);

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB\n');
    }
}

unquarantineAll().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
