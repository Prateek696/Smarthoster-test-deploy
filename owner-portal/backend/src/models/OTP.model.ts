import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  purpose: "password-reset" | "username-change";
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    purpose: { type: String, enum: ["password-reset", "username-change"], required: true },
  },
  { timestamps: true }
);

export const OTPModel = mongoose.model<IOTP>("OTP", otpSchema);
