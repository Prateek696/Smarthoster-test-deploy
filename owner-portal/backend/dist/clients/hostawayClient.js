"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostawayRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
let accessToken = null;
let tokenExpiry = null;
const getAccessToken = async () => {
    // If we already have a valid token, reuse it
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }
    const response = await axios_1.default.post(`${env_1.env.hostaway.apiBase}/accessTokens`, new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env_1.env.hostaway.apiKey,
        client_secret: env_1.env.hostaway.apiSecret,
        scope: "general",
    }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    accessToken = response.data.access_token;
    // Hostaway returns "expires_in" in seconds
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // buffer 60s
    return accessToken;
};
const hostawayRequest = async (method, endpoint, data) => {
    const token = await getAccessToken();
    const url = `${env_1.env.hostaway.apiBase}${endpoint}`;
    const config = {
        method,
        url,
        headers: { Authorization: `Bearer ${token}` },
    };
    if (data) {
        if (method === "GET") {
            config.params = data;
        }
        else {
            config.data = data;
        }
    }
    const res = await (0, axios_1.default)(config);
    return res.data;
};
exports.hostawayRequest = hostawayRequest;
