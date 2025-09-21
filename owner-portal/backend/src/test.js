import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HOSTAWAY_API_BASE = process.env.HOSTAWAY_API_BASE; // e.g., https://api.hostaway.com/v1
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY;
const HOSTAWAY_API_SECRET = process.env.HOSTAWAY_API_SECRET;

const HOSTKIT_API_URL = process.env.HOSTKIT_API_URL; // e.g., https://app.hostkit.pt/api
const HOSTKIT_API_KEY = process.env.HOSTKIT_API_KEY;

async function getHostawayToken() {
  try {
    console.log("🔑 Getting Hostaway token...");
    const { data } = await axios.post(`${HOSTAWAY_API_BASE}/accessTokens`, null, {
      params: {
        grant_type: "client_credentials",
        client_id: HOSTAWAY_API_KEY,
        client_secret: HOSTAWAY_API_SECRET,
      },
    });
    return data.access_token;
  } catch (err) {
    console.error("❌ Failed to get Hostaway token:", err.response?.data || err.message);
    return null;
  }
}

async function testHostaway() {
  const token = await getHostawayToken();
  if (!token) return;

  try {
    console.log("🔍 Testing Hostaway API...");
    const { data } = await axios.get(`${HOSTAWAY_API_BASE}/listings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Hostaway API works. Found listings:", data.result?.length || 0);
  } catch (err) {
    console.error("❌ Hostaway API Error:", err.response?.data || err.message);
  }
}

async function testHostkit() {
  try {
    console.log("🔍 Testing Hostkit API...");
    const { data } = await axios.get(`${HOSTKIT_API_URL}/getProperties`, {
      params: { APIKEY: HOSTKIT_API_KEY },
    });
    console.log("✅ Hostkit API works. Found properties:", data.length || data.result?.length || 0);
  } catch (err) {
    console.error("❌ Hostkit API Error:", err.response?.data || err.message);
  }
}

(async () => {
  await testHostaway();
  await testHostkit();
})();
