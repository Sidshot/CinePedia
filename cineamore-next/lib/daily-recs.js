import { sendPhoto } from '@/lib/telegram';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * Posts the daily recommendations (1 Movie, 1 Series, 1 Anime) to the configured chat.
 * @param {string} targetChatId - Optional override for the chat ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function postDailyRecommendations(targetChatId = null) {
    try {
        await dbConnect();
        const db = mongoose.connection.db;
        const chatId = targetChatId || process.env.TELEGRAM_CHAT_ID;

        if (!chatId) {
            return { ok: false, error: 'TELEGRAM_CHAT_ID not configured' };
        }

        // 1. Fetch Random Content
        const [randomMovie] = await db.collection('movies').aggregate([{ $sample: { size: 1 } }]).toArray();
        const [randomSeries] = await db.collection('series').aggregate([{ $sample: { size: 1 } }]).toArray();
        const [randomAnime] = await db.collection('series').aggregate([
            { $match: { genre: /Animation|Anime/i } },
            { $sample: { size: 1 } }
        ]).toArray();

        // 2. Post Movie
        if (randomMovie) {
            const caption = `
🎬 <b>Film of the Day</b>
<b>${randomMovie.title}</b> (${randomMovie.year || 'N/A'})

${randomMovie.plot ? randomMovie.plot.substring(0, 150) + '...' : ''}

👇 <b>Watch Now:</b>
https://cineamore.vercel.app/movie/${randomMovie.tmdbId}
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
https://cineamore.vercel.app/series/${randomSeries.tmdbId}
`;
            await sendPhoto(chatId, randomSeries.posterUrl, caption);
        }

        // 4. Post Anime (if found and different from series)
        if (randomAnime && (!randomSeries || randomAnime._id.toString() !== randomSeries._id.toString())) {
            const caption = `
👺 <b>Anime Pick</b>
<b>${randomAnime.title}</b>

👇 <b>Stream Now:</b>
https://cineamore.vercel.app/anime/${randomAnime.tmdbId}
`;
            await sendPhoto(chatId, randomAnime.posterUrl, caption);
        }

        return { ok: true };
    } catch (e) {
        console.error('[Daily Recs] Error:', e);
        return { ok: false, error: e.message };
    }
}
