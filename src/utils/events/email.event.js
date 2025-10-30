import { EventEmitter } from "node:events";
import sendEmail from "../mail/send.email.js";
import forgotPasswordTemplate from "../mail/templates/forgot.password.template.js";

export const emailEvent = new EventEmitter();

export const sendOTP = async ({ data, subject, template } = {}) => {
  const { email, name, otp } = data;

  const html = template({ name, otp });
  await sendEmail({ to: email, subject, html });
};

emailEvent.on("forgotPassword", async (data) => {
  await sendOTP({
    data,
    subject: "Forgot Password",
    template: forgotPasswordTemplate,
  });
});
