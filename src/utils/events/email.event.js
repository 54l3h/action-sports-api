import { EventEmitter } from "node:events";
import sendEmail from "../mail/send.email.js";
import forgotPasswordTemplate from "../mail/templates/forgot.password.template.js";
import orderInvoiceTemplate from "../mail/templates/order.invoice.template.js";

export const emailEvent = new EventEmitter();

export const sendOTP = async ({ data, subject, template } = {}) => {
  const { email, name, otp } = data;

  const html = template({ name, otp });
  await sendEmail({ to: email, subject, html });
};

export const sendInvoice = async ({ data, subject, template } = {}) => {
  const html = template(data);
  await sendEmail({
    to: data.customerEmail,
    subject,
    html,
  });
};

emailEvent.on("forgotPassword", async (data) => {
  await sendOTP({
    data,
    subject: "Forgot Password",
    template: forgotPasswordTemplate,
  });
});

emailEvent.on("orderInvoice", async (data) => {
  await sendInvoice({
    data,
    subject: `فاتورة طلب - ${data.orderId}`,
    template: orderInvoiceTemplate,
  });
});
