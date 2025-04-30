import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authenticate = (getUserById) => {
  return async (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecretKey);
      const userId = decoded.id;
      const user = await getUserById({ id: userId });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.isActive === false) {
        res.clearCookie("auth_token");
        return res
          .status(403)
          .json({ message: "User inactive, please contact support" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.clearCookie("auth_token");
      return res
        .status(403)
        .json({ message: "User inactive, please contact support" });
    }
  };
};
