const CLIENT_ID = "1415538798460272723";
const CLIENT_SECRET = "EgAnSyhqyi0FqDRhDCasFa5bldRnE7ce";
const REDIRECT_URI = "https://coreapi.online";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code) {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify`;
    return res.redirect(oauthUrl);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();

    // Set cookies
    res.setHeader('Set-Cookie', [
      cookie.serialize('discordUsername', user.username + '#' + user.discriminator, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: true
      }),
      cookie.serialize('discordID', user.id, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
        sameSite: 'lax',
        secure: true
      }),
    ]);

    // Redirect back to main site
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OAuth failed" });
  }
}
