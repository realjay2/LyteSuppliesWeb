// Serve static files (HTML + script.js)
const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Discord app info
const CLIENT_ID = '1415538798460272723';
const CLIENT_SECRET = 'EgAnSyhqyi0FqDRhDCasFa5bldRnE7ce';
const REDIRECT_URI = 'https://coreapi.online/callback'; // Your live domain

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Step 1: Redirect user to Discord OAuth
app.get("/auth/discord", (req, res) => {
  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(oauthUrl);
});

// Step 2: Discord redirects back here with ?code=...
app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect("/");

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;

    // Save to cookie or session (optional)
    res.cookie("discordUsername", `${user.username}#${user.discriminator}`, { httpOnly: false });
    res.cookie("discordID", user.id, { httpOnly: false });

    // Redirect to home page cleanly
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

