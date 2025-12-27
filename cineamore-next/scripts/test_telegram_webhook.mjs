// Native Fetch (Node 18+)
const CHAT_ID = '-1003215859244'; // Hardcoded for test

async function testWebhook() {
    console.log("Testing Telegram Webhook on Localhost...");

    const mockUpdate = {
        update_id: 123456789,
        message: {
            message_id: 1,
            from: { id: 999999, is_bot: false, first_name: "TestUser" },
            chat: { id: CHAT_ID, type: "supergroup" },
            date: 1672531200,
            text: "/start", // Simulate a text command too just in case
            new_chat_members: [
                { id: 999999, is_bot: false, first_name: "TestUser" }
            ]
        }
    };

    try {
        const res = await fetch('http://localhost:3000/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockUpdate)
        });

        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Data:", data);

        if (res.status === 200 && data.ok) {
            console.log("✅ SUCCESS: Logic is working locally!");
        } else {
            console.log("❌ FAILURE: Endpoint returned error.");
        }
    } catch (e) {
        console.error("❌ ERROR: Could not connect to localhost.");
        console.error(e.message);
    }
}

testWebhook();
