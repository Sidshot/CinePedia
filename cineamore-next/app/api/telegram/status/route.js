import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Check Env Vars
    const status = {
        env: {
            TELEGRAM_BOT_TOKEN: token ? '✅ SET (Starts with ' + token.substring(0, 5) + '...)' : '❌ MISSING',
            TELEGRAM_CHAT_ID: chatId ? '✅ SET (' + chatId + ')' : '❌ MISSING'
        },
        telegram_api: {
            webhook_info: null,
            error: null
        }
    };

    // 2. Check Webhook Status with Telegram
    if (token) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
            const data = await res.json();
            status.telegram_api.webhook_info = data;
        } catch (e) {
            status.telegram_api.error = e.message;
        }
    }

    return NextResponse.json(status, { space: 2 });
}
