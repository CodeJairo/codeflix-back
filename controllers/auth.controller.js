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

      setImmediate(async () => {
        await this.sendVerificationEmail({
          email: user.email,
          user: user.username,
        });
      });

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

  sendVerificationEmail = async ({ email, user }) => {
    const token = jwt.sign({ email }, this.config.jwtSecretKey, {
      expiresIn: "1h",
    });

    if (!token) {
      throw new Error("Token generation failed");
    }

    const verificationLink = `${this.config.apiBaseUrl}/auth/verify/${token}`;

    const html = `
<body style="margin: 0; padding: 0; background-color: #f2f5f9;">
  <!-- Wrapper general -->
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background-color: #f2f5f9; padding: 20px 0;"
  >
    <tr>
      <td align="center">
        <!-- Contenedor principal (600px) -->
        <table
          role="presentation"
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          "
        >
          <!-- HEADER -->
          <tr>
            <td style="background-color: #141414; padding: 10px;">
              <!-- Tabla interna para centrar título -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Spacer izquierdo (60px) -->
                  <td width="60"></td>

                  <!-- Título centrado -->
                  <td
                    valign="middle"
                    style="
                      text-align: center;
                      font-family: Arial, sans-serif;
                      color: #ffffff;
                      font-size: 16px;
                      font-weight: bold;
                    "
                  >
                    CODE THEN FLIX 😉
                  </td>

                  <!-- Spacer derecho (60px) -->
                  <td width="60"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separador superior -->
          <tr><td height="20"></td></tr>

          <!-- CONTENIDO PRINCIPAL -->
          <tr>
            <td style="padding: 0 30px; text-align: center; font-family: Arial, sans-serif;">
              <h1 style="margin: 0; font-size: 24px; color: #333333;">
                Verify Your Email
              </h1> 
              <p style="font-size: 16px; color: #555555; line-height: 1.5; margin: 20px 0;">
                Hi <strong>${user}</strong>! Welcome to <strong>Codeflix</strong>. Click the button below to verify your
                email and start sharing and streaming movies with our community.
              </p>

              <!-- Botón de verificación -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #ff4e50 0%, #f9d423 100%);">
                    <a
                      href="${verificationLink}"
                      style="
                        display: inline-block;
                        padding: 12px 28px;
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: bold;
                      "
                    >
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Enlace de respaldo -->
              <p style="font-size: 14px; color: #999999; margin: 20px 0; word-break: break-all;">
                If the button doesn’t work, copy and paste this URL into your browser:<br />
                <a href="${verificationLink}" style="color: #ff4e50; text-decoration: none;">
                  ${verificationLink}
                </a>
              </p>
              <p style="font-size: 14px; color: #999999; margin: 0;">
                This link expires in 24 hours.
              </p>
            </td>
          </tr>

          <!-- Separador inferior -->
          <tr><td height="30"></td></tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #fafafa; text-align: center; padding: 20px 30px; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
              <p style="margin: 0;">
                If you didn’t sign up for Codeflix, you can ignore this email.
              </p>
              <p style="margin: 5px 0 0;">
                Need help?
                <a href="https://codeflix.com/support" style="color: #141414; text-decoration: none;">
                  Contact Support
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
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
