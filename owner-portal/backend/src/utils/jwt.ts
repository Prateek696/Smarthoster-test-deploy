import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: "5h" });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
