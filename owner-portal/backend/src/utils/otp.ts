import crypto from "crypto";

export const generateOTP = (length = 6): string => {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
};
