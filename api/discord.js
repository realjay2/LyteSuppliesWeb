import axios from "axios";

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = "https://coreapi.online/api/discord";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  // Step 1: Redirect user to Discord if no code
  if (!code) {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify`;
    return res.redirect(oauthUrl);
  }

  try {
    // Step 2: Exchange code for access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 3: Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;

    // Step 4: Return JSON (frontend can save to localStorage)
    res.status(200).json({
      discordUsername: `${user.username}#${user.discriminator}`,
      discordID: user.id,
    });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "OAuth failed" });
  }
}
