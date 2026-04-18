const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors()); // Kisi bhi frontend se request allow karne ke liye
app.use(express.json()); // JSON data receive karne ke liye

// Aap ke Bot aur Channel ki Details
const BOT_TOKEN = process.env.BOT_TOKEN; 

// یہی لائن اپنے کوڈ میں کاپی کر لیں:
const CHAT_ID = "@healthjobsportal"; 


// Basic Route - Check karne ke liye ke API zinda hai ya nahi
app.get('/', (req, res) => {
    res.send('HealthJobs Telegram Bot API is running perfectly! 🚀');
});

// Main Route - Frontend se job ka data yahan aayega
app.post('/api/send-alert', async (req, res) => {
    // Frontend se Title, Location aur Link receive karna
    const { title, location, link } = req.body;

    // Agar koi detail miss ho toh error do
    if (!title || !location || !link) {
        return res.status(400).json({ error: "Job details incomplete hain!" });
    }

    // Telegram Message ka Design
    const message = `🚨 <b>New Healthcare Job Alert!</b> 🚨\n\n🏥 <b>Position:</b> ${title}\n📍 <b>Location:</b> ${location}\n\n👉 <b>Apply Here:</b> ${link}`;
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        // Telegram ko Data bhejna
        await axios.post(telegramApiUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
        });
        
        // Agar success ho jaye
        res.status(200).json({ success: true, message: "Telegram par post successfully chali gayi!" });
    } catch (error) {
        // Agar fail ho jaye
        console.error("Telegram API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: "Telegram par post fail ho gayi." });
    }
});

// Local testing ke liye Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Vercel Serverless Functions ke liye zaroori line
module.exports = app;
  