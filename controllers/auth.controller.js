import jwt from "jsonwebtoken";
import { validateLogin, validateUser } from "../schemas/user.schema.js";

export class AuthController {
  constructor({ authModel, emailService, config }) {
    this.authModel = authModel;
    this.config = config;
    this.emailService = emailService;
  }

  login = async (req, res) => {
    const validationUser = validateLogin(req.body);
    if (!validationUser.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validationUser.error.message) });
    }
    const { email, password } = validationUser.data;
    try {
      const user = await this.authModel.login({ email, password });

      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        this.config.jwtSecretKey,
        {
          expiresIn: "1h",
        }
      );
      return res
        .cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60, // 1 hour
        })
        .status(200)
        .send(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  register = async (req, res) => {
    const validationUser = validateUser(req.body);
    if (!validationUser.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validationUser.error.message) });
    }
    const { username, email, password } = validationUser.data;

    try {
      const user = await this.authModel.register({ username, email, password });
      await this.sendVerificationEmail({ email: user.email });
      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        this.config.jwtSecretKey,
        {
          expiresIn: "1h",
        }
      );
      return res
        .cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60, // 1 hour
        })
        .status(200)
        .send(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  verifyEmail = async (req, res) => {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, this.config.jwtSecretKey);
    const { email } = decodedToken;
    try {
      await this.authModel.verifyEmail({ email });
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  logout = (_, res) => {
    res.clearCookie("auth_token");
    return res.status(200).json({ message: "Logged out successfully" });
  };

  deleteUser = async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    try {
      const decodedToken = jwt.verify(token, this.config);
      const { isAdmin } = decodedToken;
      if (!isAdmin) {
        return res.status(403).json({ message: "User not authorized" });
      }
      const { id } = req.params;
      await this.authModel.deleteUser({ id });
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  sendVerificationEmail = async ({ email }) => {
    const token = jwt.sign({ email }, this.config.jwtSecretKey, {
      expiresIn: "1h",
    });

    if (!token) {
      throw new Error("Token generation failed");
    }

    const verificationLink = `${this.config.apiBaseUrl}/auth/verify/${token}`;

    const html = `
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  .button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 25px;
    background-color: #4caf50;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
  }
  .footer {
    margin-top: 30px;
    font-size: 12px;
    color: #888;
  }

  .text-white {
    color: rgb(255, 255, 255);
  }
</style>

<div class="container">
  <h1>Confirm Your Email Address</h1>
  <p>
    Thank you for signing up! Please click the button below to confirm your email address and activate your account.
  </p>
  <a href="${verificationLink}" class="button">Confirm Email</a>
  <div class="footer">
    <p>If you did not request this email, please ignore it.</p>
  </div>
</div>
`;

    const subject = "Email Verification";

    const options = {
      to: email,
      subject: subject,
      html,
    };

    const isEmailSent = await this.emailService.sendVerificationEmail(options);
    if (!isEmailSent) {
      throw new Error("Failed to send verification email");
    }
    return;
  };
}
