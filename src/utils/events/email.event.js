import { EventEmitter } from "node:events";
import sendEmail from "../mail/send.email.js";
// import confirmEmailTemplate from "../email/templates/confirmEmail.template.js";
// import forgotPasswordTemplate from "../email/templates/forgotPassword.template.js";
// import forgotPasswordTemplate from "../email/templates/";
// import generateOTP from "../../utils/email/generateOTP.js";
import forgotPasswordTemplate from "../mail/templates/forgot.password.template.js";

export const emailEvent = new EventEmitter();

export const sendOTP = async ({ data, subject, template } = {}) => {
  const { email, name, otp } = data;
  // const { hashedOTP, OTP } = generateOTP();
  // const OTP_EXPIRATION_TIME = parseInt(process.env.OTP_EXPIRATION_TIME);
  // const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME);

  // const otpEntry = {
  //   code: hashedOTP,
  //   type: subject,
  //   expiresIn: expirationTime,
  // };

  // await dbService.findByIdAndUpdate({
  //   model: User,
  //   id,
  //   data: {
  //     $push: { OTP: otpEntry },
  //   },
  // });

  const html = template({ name, otp });
  await sendEmail({ to: email, subject, html });
};

// export const sendApplicationStatus = async ({ data, subject, template } = {}) => {
//   const { email } = data;
//   const html = template();
//   await sendEmail({ to: email, subject, html });
// };

// emailEvent.on("sendConfirmEmail", async (data) => {
//   await sendOTP({
//     data,
//     subject: OtpTypes.CONFIRM_EMAIL,
//     template: confirmEmailTemplate,
//   });
// });

emailEvent.on("forgotPassword", async (data) => {
  await sendOTP({
    data,
    subject: "Forgot Password",
    template: forgotPasswordTemplate,
  });
});
