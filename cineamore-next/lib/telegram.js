const TAG = '[Telegram]';

/**
 * Send a message to a specific chat
 * @param {string|number} chatId 
 * @param {string} text 
 * @param {object} options (parse_mode, reply_markup, etc.)
 */
export async function sendMessage(chatId, text, options = {}) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error(`${TAG} Missing TELEGRAM_BOT_TOKEN`);
        return;
    }

    try {
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            ...options
        };

        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!data.ok) {
            console.error(`${TAG} Error sending message:`, data.description);
        } else {
            console.log(`${TAG} Message sent to ${chatId}`);
        }
        return data;
    } catch (e) {
        console.error(`${TAG} Network error:`, e);
    }
}

/**
 * Send a photo to a specific chat
 * @param {string|number} chatId 
 * @param {string} photoUrl 
 * @param {string} caption 
 * @param {object} options 
 */
export async function sendPhoto(chatId, photoUrl, caption, options = {}) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    try {
        const body = {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML',
            ...options
        };

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!data.ok) {
            console.error(`${TAG} Error sending photo:`, data.description);
        }
        return data;
    } catch (e) {
        console.error(`${TAG} Network error:`, e);
    }
}
