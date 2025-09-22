import axios from "axios";
import { env } from "../config/env";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

const getAccessToken = async () => {
  // If we already have a valid token, reuse it
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post(
    `${env.hostaway.apiBase}/accessTokens`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.hostaway.apiKey,
      client_secret: env.hostaway.apiSecret,
      scope: "general",
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  accessToken = response.data.access_token;
  // Hostaway returns "expires_in" in seconds
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // buffer 60s
  return accessToken;
};

export const hostawayRequest = async (method: "GET" | "POST" | "PUT" | "DELETE", endpoint: string, data?: any) => {
  const token = await getAccessToken();
  const url = `${env.hostaway.apiBase}${endpoint}`;

  const config: any = {
    method,
    url,
    headers: { Authorization: `Bearer ${token}` },
  };

  if (data) {
    if (method === "GET") {
      config.params = data;
    } else {
      config.data = data;
    }
  }

  const res = await axios(config);
  return res.data;
};
