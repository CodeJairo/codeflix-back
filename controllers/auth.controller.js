import jwt from "jsonwebtoken";
import {
  InternalServerError,
  CustomError,
  AuthorizationError,
} from "../utils/custom-error.js";

export class AuthController {
  constructor({ authModel, emailService, config }) {
    this.authModel = authModel;
    this.config = config;
    this.emailService = emailService;
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await this.authModel.login({ email, password });
      this.#setAuthCookie(res, user);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = await this.authModel.register({
        username,
        email,
        password,
      });

      setImmediate(async () => {
        try {
          await this.emailService.sendVerificationEmail(user);
        } catch (error) {
          console.log(error.message);
        }
      });

      this.#setAuthCookie(res, user);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
      const decodedToken = jwt.verify(token, this.config.jwtSecretKey);
      const { email } = decodedToken;
      await this.authModel.verifyEmail({ email });
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  logout = (_, res) => {
    try {
      res.clearCookie("auth_token");
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user.isAdmin)
        throw new AuthorizationError("Unauthorized to delete users");

      await this.authModel.deleteUser({ id });
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  #handleError = (error, res) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  };

  #setAuthCookie = (res, user) => {
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      this.config.jwtSecretKey,
      { expiresIn: "1h" }
    );

    if (!token) throw new InternalServerError("Error generating token");

    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      })
      .status(200)
      .send(user);
  };
}
