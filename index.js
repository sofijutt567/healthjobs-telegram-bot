const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// آپ کے بوٹ اور چینل کی ڈیٹیلز
const BOT_TOKEN = process.env.BOT_TOKEN; 
const CHAT_ID = "@healthjobsportal"; // یہ آپ کے چینل کا یوزر نیم ہے

// Basic Route
app.get('/', (req, res) => {
    res.send('HealthJobs Telegram Bot API is running perfectly! 🚀');
});

// Main Route - Frontend se data yahan aayega
app.post('/api/send-alert', async (req, res) => {
    
    // Frontend se aane wala sara data
    const { type, title, desc, location, link, salary, qualification, mediaUrl } = req.body;

    if (!title || !link) {
        return res.status(400).json({ error: "Title and link are required!" });
    }

    let message = "";
    
    // Description ko thora chota karna taake Telegram limit cross na kare (maximum 200 characters)
    const shortDesc = desc ? (desc.length > 200 ? desc.substring(0, 200) + "..." : desc) : "";

    // 1. General Post (simple.html) ke liye
    if (type === 'general_post') {
        message = `📢 <b>New Medical Update!</b>\n\n`;
        if (title) message += `📌 <b>${title}</b>\n`;
        if (shortDesc) message += `📝 ${shortDesc}\n`;
        if (location && location !== "Pakistan") message += `📍 <b>Location:</b> ${location}\n`;
    } 
    // 2. Employer Job Post (employer.html) ke liye
    else if (type === 'employer_post') {
        message = `💼 <b>New Job Opening!</b>\n\n`;
        message += `🏥 <b>Position:</b> ${title}\n`;
        if (qualification) message += `🎓 <b>Category:</b> ${qualification}\n`;
        if (location) message += `📍 <b>Location:</b> ${location}\n`;
        if (salary) message += `💰 <b>Salary:</b> ${salary}\n\n`;
        if (shortDesc) message += `📝 <b>Details:</b> ${shortDesc}\n`;
    }
    // 3. Candidate Profile (candidate.html) ke liye
    else if (type === 'candidate_post') {
        message = `👤 <b>Candidate Available!</b>\n\n`;
        message += `👨‍⚕️ <b>Profession:</b> ${title}\n`;
        if (qualification) message += `🎓 <b>Qualification:</b> ${qualification}\n`;
        if (location) message += `📍 <b>Location:</b> ${location}\n`;
        if (salary) message += `💰 <b>Expected Salary:</b> ${salary}\n\n`;
        if (shortDesc) message += `📝 <b>Bio:</b> ${shortDesc}\n`;
    }
    // Fallback (Agar type match na ho)
    else {
        message = `🚨 <b>Health Jobs Alert!</b>\n\n`;
        message += `📌 <b>${title}</b>\n`;
        if (location) message += `📍 ${location}\n`;
        if (shortDesc) message += `📝 ${shortDesc}\n`;
    }

    // Link Hamesha End Par Aayega
    message += `\n👉 <b>Click Here to View Details:</b>\n${link}`;

    try {
        // Agar mediaUrl mojood hai aur woh Image (jpg/png) hai
        if (mediaUrl && mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                chat_id: CHAT_ID,
                photo: mediaUrl,
                caption: message,
                parse_mode: "HTML"
            });
        } 
        // Agar Image nahi hai ya PDF/Video hai (Toh sirf Text aur Link bhejein)
        else {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: false // Link ka preview dikhane ke liye
            });
        }

        res.status(200).json({ success: true, message: "Telegram par post successfully chali gayi!" });
    } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error("Telegram API Error:", errorMessage);
        res.status(500).json({ success: false, error: "Telegram par post fail ho gayi." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
