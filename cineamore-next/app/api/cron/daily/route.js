import { NextResponse } from 'next/server';
import { sendPhoto } from '@/lib/telegram';
import clientPromise from '@/lib/mongodb';

// Vercel Cron Secret for security
// const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req) {
    // Check Authorization (if CRON_SECRET is set)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        const client = await clientPromise;
        const db = client.db('cinepedia');
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!chatId) {
            return NextResponse.json({ error: 'TELEGRAM_CHAT_ID not configured' }, { status: 500 });
        }

        // 1. Fetch Random Content (1 Movie, 1 Series, 1 Anime)
        // Using $sample aggregation is efficient for this
        const [randomMovie] = await db.collection('movies').aggregate([{ $sample: { size: 1 } }]).toArray();
        const [randomSeries] = await db.collection('series').aggregate([{ $sample: { size: 1 } }]).toArray();
        // Assuming 'anime' is in 'series' collection with a flag or separate collection. 
        // Based on previous code, anime share 'series' collection but we filter?
        // Let's assume separate 'series' collection contains both for now, or fetch another random one.
        // If you have a specific way to distinguish anime, add $match. 
        // For now, let's grab another series to be safe or try to find one with genre 'Animation'.
        const [randomAnime] = await db.collection('series').aggregate([
            { $match: { genre: /Animation|Anime/i } },
            { $sample: { size: 1 } }
        ]).toArray();


        // 2. Post Movie
        if (randomMovie) {
            const caption = `
🎬 <b>Film of the Day</b>
<b>${randomMovie.title}</b> (${randomMovie.year})

${randomMovie.plot ? randomMovie.plot.substring(0, 150) + '...' : ''}

👇 <b>Watch Now:</b>
https://cinepedia.vercel.app/movie/${randomMovie.tmdbId}
`;
            await sendPhoto(chatId, randomMovie.posterUrl, caption);
        }

        // 3. Post Series
        if (randomSeries) {
            const caption = `
📺 <b>Series Recommendation</b>
<b>${randomSeries.title}</b>

${randomSeries.plot ? randomSeries.plot.substring(0, 150) + '...' : ''}

👇 <b>Start Bingeing:</b>
https://cinepedia.vercel.app/series/${randomSeries.tmdbId}
`;
            await sendPhoto(chatId, randomSeries.posterUrl, caption);
        }

        // 4. Post Anime (if found)
        if (randomAnime && randomAnime._id.toString() !== randomSeries._id.toString()) {
            const caption = `
👺 <b>Anime Pick</b>
<b>${randomAnime.title}</b>

👇 <b>Stream Now:</b>
https://cinepedia.vercel.app/anime/${randomAnime.tmdbId}
`;
            await sendPhoto(chatId, randomAnime.posterUrl, caption);
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[Daily Cron] Error:', e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
