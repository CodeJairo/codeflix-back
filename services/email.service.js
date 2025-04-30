import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { InternalServerError } from "../utils/custom-error.js";
import { createVerificationEmail } from "../utils/verification-email.js";
import config from "../config/config.js";

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.mailerService,
      auth: {
        pass: config.mailerKey,
        user: config.mailerEmail,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(user) {
    try {
      const token = jwt.sign({ email: user.email }, config.jwtSecretKey, {
        expiresIn: "24h",
      });

      if (!token) {
        throw new InternalServerError("Error generating token");
      }

      const verificationLink = `${config.apiBaseUrl}/auth/verify/${token}`;
      const html = createVerificationEmail({
        user: user.username,
        verificationLink,
      });

      await this.transporter.sendMail({
        from: '"Codeflix 🎥🍿" <codeflix720@gmail.com>',
        to: user.email,
        subject: "Email Verification",
        html: html,
      });
      console.log("Message sent");
    } catch (error) {
      console.log(error.message);
      throw new InternalServerError("Error sending email");
    }
  }
}
