const https = require('https');

const apiKey = "AIzaSyA72-RmFxPjKQbtQWpdnVnDlSOFL1sbRp4";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const models = JSON.parse(data);
            console.log("Status:", res.statusCode);
            if (models.models) {
                models.models.forEach(m => {
                    if (m.name.includes("gemini") || m.name.includes("flash")) {
                        console.log(m.name);
                    }
                });
            } else {
                console.log(data);
            }
        } catch (e) {
            console.error(e);
            console.log(data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
