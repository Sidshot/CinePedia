import dbConnect from './mongodb';
import Movie from '@/models/Movie';

// Simple seeded random generator based on current date string
function seededRandom(seed) {
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    }
    h = ((h ^ h >>> 16) >>> 0) / 4294967296;
    return h;
}

// Fisher-Yates shuffle with seeded random
function seededShuffle(array, seedStr) {
    let m = array.length, t, i;
    let seedVal = seededRandom(seedStr);

    // Create a deterministic pseudo-random sequence from the seed
    const random = () => {
        seedVal = (seedVal * 9301 + 49297) % 233280;
        return seedVal / 233280;
    };

    while (m) {
        i = Math.floor(random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

export async function getDailyTrending() {
    await dbConnect();

    // 1. Get Pool of High Rated Movies (> 6) released AFTER 1980
    const candidates = await Movie.find({
        tmdbRating: { $gt: 6 },
        year: { $gt: 1980 },
        'visibility.state': 'visible'
    })
        .sort({ tmdbRating: -1 })
        .limit(100) // Larger pool to ensure variety
        .lean();

    // Fallback: If not enough rated movies, grab recently added (still after 1980)
    let pool = candidates;
    if (pool.length < 10) {
        pool = await Movie.find({
            'visibility.state': 'visible',
            year: { $gt: 1980 }
        })
            .sort({ addedAt: -1 })
            .limit(50)
            .lean();
    }

    // 2. Separate into post-2000 and 1981-2000
    const post2000 = pool.filter(m => m.year > 2000);
    const pre2000 = pool.filter(m => m.year <= 2000 && m.year > 1980);

    // 3. Shuffle both pools based on Date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const shuffledPost2000 = seededShuffle([...post2000], today);
    const shuffledPre2000 = seededShuffle([...pre2000], today + '-pre');

    // 4. Build final list: At least 5 from post-2000, rest from pre-2000
    let final = [];

    // Take up to 5 post-2000 films first
    final.push(...shuffledPost2000.slice(0, Math.min(5, shuffledPost2000.length)));

    // Fill remaining slots from pre-2000
    const remaining = 10 - final.length;
    final.push(...shuffledPre2000.slice(0, remaining));

    // If still not 10, add more post-2000
    if (final.length < 10) {
        final.push(...shuffledPost2000.slice(5, 10 - final.length + 5));
    }

    // 5. Final shuffle to mix the order
    const finalShuffled = seededShuffle(final, today + '-final');

    // 6. Return Top 10 (serialized)
    return finalShuffled.slice(0, 10).map(m => ({
        ...m,
        _id: m._id.toString()
    }));
}
