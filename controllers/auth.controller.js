import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config.js";
import { validateUser } from "../schemas/user.schema.js";

export class AuthController {
  constructor({ authModel }) {
    this.authModel = authModel;
  }

  login = async (req, res) => {
    const validationUser = validateUser(req.body);
    if (!validationUser.success) {
      return res
        .status(400)
        .json({ message: JSON.parse(validationUser.error.message) });
    }
    const { username, password } = validationUser.data;
    try {
      const user = await this.authModel.login({ username, password });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET_KEY,
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
    const { username, password } = validationUser.data;

    try {
      const user = await this.authModel.register({ username, password });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET_KEY,
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

  logout = (_, res) => {
    res.clearCookie("auth_token");
    return res.status(200).json({ message: "Logged out successfully" });
  };
}
