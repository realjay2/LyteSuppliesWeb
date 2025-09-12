import axios from "axios";

const CLIENT_ID = '1415538798460272723';
const CLIENT_SECRET = 'EgAnSyhqyi0FqDRhDCasFa5bldRnE7ce';
const REDIRECT_URI = 'https://coreapi.online/api/discord';

export default async function handler(req, res) {
  const { code } = req.query;

  // Step 1: Redirect user to Discord if no code
  if (!code) {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
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
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 3: Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;

    // Step 4: Return JSON to frontend (or set cookies)
    res.status(200).json({
      discordUsername: `${user.username}#${user.discriminator}`,
      discordID: user.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OAuth failed" });
  }
}
