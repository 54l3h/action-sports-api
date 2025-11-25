import nodemailer from "nodemailer";
import path from "node:path";

const sendEmail = async ({
  to = [],
  cc = [],
  bcc = [],
  subject = "",
  text = "",
  html = "",
  attachments = [],
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    secure: true,
  });

  const info = await transporter.sendMail({
    from: `"Support Team" <${process.env.MAIL_USER}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve("src/utils/mail/assets/ActionSports.png"),
        cid: "logo",
      },
    ],
  });

  return info;
};

export default sendEmail;
