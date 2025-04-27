import nodemailer from "nodemailer";

export class EmailService {
  constructor({ mailerService, mailerEmail, mailerKey }) {
    this.transporter = nodemailer.createTransport({
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: mailerKey,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(options) {
    const { to, subject, html } = options;
    try {
      const message = await this.transporter.sendMail({
        from: '"Codeflix 🎥🍿" <codeflix720@gmail.com>', // Remitente claro
        to: to,
        subject: subject,
        html: html,
      });
      console.log("Message sent");
      return true;
    } catch (error) {
      console.log({ error });
      return false;
    }
  }
}
