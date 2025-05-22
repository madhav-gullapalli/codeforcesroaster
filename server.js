// This script fetches data from the Codeforces API and generates a roast using the DeepSeek API.


require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Use built-in fetch if available, otherwise use node-fetch
let fetchFunc;
try {
    fetchFunc = fetch;
} catch {
    fetchFunc = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}

const API_KEY = process.env.DEEPSEEK_API_KEY;

app.post('/api/roast', async (req, res) => {
    const msg = req.body.msg;
    try {
        const response = await fetchFunc('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: msg }]
            })
        });
        const data = await response.json();
        console.log('DeepSeek API response:', data);
        res.json({ roast: data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch roast.' });
    }
});

// Serve static files (your frontend)
app.use(express.static('.'));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));