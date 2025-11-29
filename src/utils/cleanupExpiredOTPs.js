import User from "../models/user.model.js";
import logger from "./logger.js";

export const cleanupExpiredOTPs = async () => {
  try {
    const now = Date.now();

    const result = await User.updateMany(
      {
        $or: [
          { activationCodeExpiresAt: { $lt: now } },
          { passwordResetCodeExpiresAt: { $lt: now } },
        ],
      },
      {
        $unset: {
          activationCode: "",
          activationCodeExpiresAt: "",
          passwordResetCode: "",
          passwordResetCodeExpiresAt: "",
          passwordResetCodeVerified: "",
        },
      }
    );

    logger.info(
      `Expired OTPs cleaned up successfully. ${result.modifiedCount} records updated.`
    );
  } catch (error) {
    logger.error(`Error cleaning up expired OTPs: ${error.message}`, {
      error,
    });
  }
};
