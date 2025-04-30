import crypto from "node:crypto";
import DBLocal from "db-local";
import bcrypt from "bcrypt";
import { formatDateToYYYYMMDD } from "../utils/format-date.js";
import {
  AuthorizationError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  CustomError,
} from "../utils/custom-error.js";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  isValidated: { type: Boolean, default: false },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
  updatedAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
});

export class AuthModel {
  static async login({ email, password }) {
    try {
      const user = User.findOne({ email });
      if (!user) throw new NotFoundError("User not found");
      if (!user.isActive)
        throw new AuthorizationError("User inactive, please contact support");

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) throw new AuthorizationError("Invalid password");

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isValidated: user.isValidated,
        isAdmin: user.isAdmin,
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError("User login failed");
    }
  }

  static async register({ username, email, password }) {
    const usernameExists = User.findOne({ username });
    const emailExists = User.findOne({ email });

    if (usernameExists) throw new ConflictError("Username already exists");
    if (emailExists) throw new ConflictError("Email already exists");

    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      _id: id,
      email,
      username,
      password: hashedPassword,
    }).save();

    return {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isActive: true,
      isValidated: false,
      isAdmin: false,
    };
  }
  catch(error) {
    if (error instanceof CustomError) throw error;
    throw new InternalServerError("User registration failed");
  }

  static async deleteUser({ id }) {
    try {
      const user = User.findOne({ _id: id });
      if (!user) throw new NotFoundError("User not found");

      if (user.isAdmin)
        throw new AuthorizationError("Cannot delete admin user");

      user.isActive = false;
      user.updatedAt = formatDateToYYYYMMDD(new Date());
      user.save();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError("User deletion failed");
    }
  }

  static async validateUserStatus(id) {
    try {
      const user = User.findOne({ _id: id });
      if (!user || !user.isActive) return false;
      return true;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError("User validation failed");
    }
  }

  static async verifyEmail({ email }) {
    try {
      const user = User.findOne({ email });
      if (!user) throw new NotFoundError("User not found");
      if (user.isValidated) throw new ConflictError("Email already verified");

      user.isValidated = true;
      user.updatedAt = formatDateToYYYYMMDD(new Date());
      user.save();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError("Email verification failed");
    }
  }

  static async getUserById(id) {
    try {
      const user = User.findOne({ _id: id });
      if (!user) throw new NotFoundError("User not found");
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isValidated: user.isValidated,
        isAdmin: user.isAdmin,
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError("User retrieval failed");
    }
  }
}
