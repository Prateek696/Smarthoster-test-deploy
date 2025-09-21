import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // true for port 465, false otherwise
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});
