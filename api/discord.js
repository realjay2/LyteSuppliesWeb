const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1415538798460272723";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "EgAnSyhqyi0FqDRhDCasFa5bldRnE7ce";
const REDIRECT_URI = "https://coreapi.online/api/discord";
const WEBHOOK_URL = "https://discord.com/api/webhooks/1415852727145336832/RrVh5LhYuqcAsUtnZkHIkcPOrJmKrmdQePFrOpuQh_AvSdLNNN1oND7xPv3v4z_64p1"; // Discord webhook for logging

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;
  if (!code) {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify`;
    return res.redirect(oauthUrl);
  }

  try {
    // Exchange code for token
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

    // Get IP and basic geo info
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geoData = await geoRes.json().catch(() => ({}));

    // Device info (basic, from headers)
    const ua = req.headers["user-agent"] || "Unknown";
    const deviceInfo = {
      browserName: ua.split(" ")[0],
      browserVersion: ua.split("/")[1] || "Unknown",
      osName: process.platform,
      deviceType: "Web",
      platform: process.platform,
      language: req.headers["accept-language"] || "Unknown",
      screenWidth: "Unknown",
      screenHeight: "Unknown",
      pixelRatio: 1,
    };

    // Create Discord embed
    const embedPayload = {
      username: "Website Discord Login Logger",
      embeds: [
        {
          title: "User Logged In via Discord",
          color: 0xffa500, // light orange
          thumbnail: {
            url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
          },
          fields: [
            { name: "Discord Username", value: `${user.username}#${user.discriminator}`, inline: true },
            { name: "Discord ID", value: user.id, inline: true },
            { name: "IP Address", value: ip, inline: true },
            {
              name: "Location",
              value: `${geoData.city || "Unknown City"}, ${geoData.region || "Unknown Region"}, ${
                geoData.country_name || "Unknown Country"
              }`,
              inline: true,
            },
            { name: "ISP", value: geoData.org || "Unknown", inline: true },
            { name: "AS", value: geoData.asn || "Unknown", inline: true },
            { name: "Timestamp", value: new Date().toISOString(), inline: false },
            { name: "Browser", value: `${deviceInfo.browserName} v${deviceInfo.browserVersion}`, inline: true },
            { name: "Operating System", value: deviceInfo.osName, inline: true },
            { name: "Device Type", value: deviceInfo.deviceType, inline: true },
            { name: "Platform", value: deviceInfo.platform, inline: true },
            { name: "Language", value: deviceInfo.language, inline: true },
            { name: "Screen Resolution", value: `${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}`, inline: true },
            { name: "Pixel Ratio", value: deviceInfo.pixelRatio.toString(), inline: true },
          ],
          footer: { text: "CoreAPI | Website Logging" },
        },
      ],
    };

    // Send to webhook
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload),
      });
    }

    // Return JSON for frontend
    res.status(200).json({
      discordUsername: `${user.username}#${user.discriminator}`,
      discordID: user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OAuth failed" });
  }
}
