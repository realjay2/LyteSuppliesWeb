// server.js
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();

const IPQS_API_KEY = "SWgopyQ1BpuIatIVTOfez7dgTNyENSpm"; // your key

// Serve your main site files
app.use(express.static(__dirname));

// Endpoint to check VPN/proxy
app.get("/check-vpn", async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(",")[0] || req.socket.remoteAddress;
  try {
    const response = await fetch(`https://www.ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${ip}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("VPN check failed:", err);
    res.status(500).json({ error: "VPN check failed" });
  }
});

// Serve vpn.html page
app.get("/vpn", (req, res) => {
  res.sendFile(path.join(__dirname, "vpn.html"));
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
