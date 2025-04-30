import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { CustomError, InternalServerError } from "../utils/custom-error.js";
import { createVerificationEmail } from "../utils/verification-email.js";

export class EmailService {
  constructor({ config }) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      service: this.config.mailerService,
      auth: {
        pass: this.config.mailerKey,
        user: this.config.mailerEmail,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(user) {
    try {
      const token = jwt.sign({ email: user.email }, this.config.jwtSecretKey, {
        expiresIn: "24h",
      });

      if (!token) {
        throw new InternalServerError("Error generating token");
      }

      const verificationLink = `${this.config.apiBaseUrl}/auth/verify/${token}`;
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
