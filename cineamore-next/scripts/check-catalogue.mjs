import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MovieSchema = new mongoose.Schema({
    title: String,
    genre: [String],
    year: Number
}, { strict: false });

const Movie = mongoose.model('Movie', MovieSchema);

async function checkCatalogue() {
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Movie.countDocuments();
    console.log('Total items in catalogue:', total);

    // Check if there are any series-related genres
    const genres = await Movie.aggregate([
        { $unwind: '$genre' },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 25 }
    ]);
    console.log('\nTop Genres:');
    genres.forEach(g => console.log(`  ${g._id}: ${g.count}`));

    // Check for TV/Series related entries
    const tvKeywords = await Movie.countDocuments({
        $or: [
            { genre: { $in: ['TV', 'Series', 'Television', 'Mini-Series'] } },
            { title: { $regex: /season|episode|series/i } }
        ]
    });
    console.log('\nPossible TV/Series entries:', tvKeywords);

    process.exit(0);
}

checkCatalogue().catch(console.error);
