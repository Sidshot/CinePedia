import { sendPhoto } from '@/lib/telegram';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * Posts the daily recommendations (1 Movie, optionally 1 Series) to the configured chat.
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

        // 1. Fetch Random Movie
        const [randomMovie] = await db.collection('movies').aggregate([{ $sample: { size: 1 } }]).toArray();

        // 2. Post Movie (using __id for the URL - this is the custom unique identifier)
        if (randomMovie) {
            const movieId = randomMovie.__id || randomMovie._id.toString();
            const caption = `
🎬 <b>Film of the Day</b>
<b>${randomMovie.title}</b> (${randomMovie.year || 'N/A'})

${randomMovie.plot ? randomMovie.plot.substring(0, 150) + '...' : ''}

👇 <b>Watch Now:</b>
https://cineamore.vercel.app/movie/${movieId}
`;
            await sendPhoto(chatId, randomMovie.posterUrl, caption);
        }

        // 3. Try to fetch Series (graceful if collection doesn't exist)
        try {
            const [randomSeries] = await db.collection('series').aggregate([{ $sample: { size: 1 } }]).toArray();
            if (randomSeries) {
                const seriesId = randomSeries.tmdbId || randomSeries._id.toString();
                const caption = `
📺 <b>Series Recommendation</b>
<b>${randomSeries.title}</b>

${randomSeries.plot ? randomSeries.plot.substring(0, 150) + '...' : ''}

👇 <b>Start Bingeing:</b>
https://cineamore.vercel.app/series/${seriesId}
`;
                await sendPhoto(chatId, randomSeries.posterUrl, caption);
            }
        } catch (e) {
            console.log('[Daily Recs] No series collection or empty');
        }

        return { ok: true };
    } catch (e) {
        console.error('[Daily Recs] Error:', e);
        return { ok: false, error: e.message };
    }
}
