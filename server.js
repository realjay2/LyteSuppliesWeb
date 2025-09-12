const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000; // You can use 80 or 443 if on production

// Replace with your Discord app credentials
const CLIENT_ID = '1415538798460272723';
const CLIENT_SECRET = 'EgAnSyhqyi0FqDRhDCasFa5bldRnE7ce';
const REDIRECT_URI = 'https://coreapi.online/callback'; // Your live domain

// Serve static files (HTML + script.js)
app.use(express.static('public'));

// Step 1: Redirect user to Discord OAuth2
app.get('/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});

// Step 2: Discord redirects back here with ?code=XXXX
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('No code provided');

    // Exchange code for access token
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json();

        // Redirect to frontend with username in query string
        res.redirect(`/index.html?username=${encodeURIComponent(userData.username + '#' + userData.discriminator)}`);
    } catch (err) {
        console.error(err);
        res.send('Error during Discord login');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at https://coreapi.online:${PORT}`);
});
