import https from 'https';

const token = '8310376679:AAEBETH_igtUgjG6DGfEgdDYnBjKLGnctsI';
const url = `https://api.telegram.org/bot${token}/getUpdates`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.result && json.result.length > 0) {
                // Log the Chat ID of the first message
                console.log('CHAT_ID:', json.result[0].message.chat.id);
                console.log('CHAT_TITLE:', json.result[0].message.chat.title);
            } else {
                console.log('No updates found.');
            }
        } catch (e) {
            console.error('Error parsing JSON');
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
