import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function findBad() {
    await mongoose.connect(MONGODB_URI);
    const Movie = mongoose.models.Movie || mongoose.model('Movie', new mongoose.Schema({ title: String, year: mongoose.Schema.Types.Mixed }, { strict: false }));

    // Find bad years
    const bad = await Movie.find({
        $or: [
            { year: { $lt: 1880 } },
            { year: { $gt: 2100 } },
            { year: { $type: "string" } },
            { year: null },
            { year: { $exists: false } }
        ]
    }).select('title year __id');

    console.log(JSON.stringify(bad, null, 2));
    await mongoose.disconnect();
}

findBad();
