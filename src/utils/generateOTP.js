import crypto from "node:crypto";

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};
