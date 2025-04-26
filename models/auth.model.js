import crypto from "node:crypto";
import DBLocal from "db-local";
import bcrypt from "bcrypt";
import { formatDateToYYYYMMDD } from "../utils/format-date.js";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
  updatedAt: { type: Date, default: formatDateToYYYYMMDD(new Date()) },
});

export class AuthModel {
  static async login({ username, password }) {
    try {
      const user = User.findOne({ username });
      if (!user) throw new Error("User not found");
      if (!user.isActive)
        throw new Error("User inactive, please contact support");

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) throw new Error("Invalid password");

      return { username: user.username, id: user._id, isAdmin: user.isAdmin };
    } catch (error) {
      throw new Error("Login failed: " + error.message);
    }
  }

  static async register({ username, password }) {
    try {
      const user = User.findOne({ username });
      if (user) throw new Error("User already exists");

      const id = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = User.create({
        _id: id,
        username,
        password: hashedPassword,
      }).save();

      return {
        id: newUser._id,
        username: newUser.username,
        isAdmin: false,
      };
    } catch (error) {
      throw new Error("Register failed: " + error.message);
    }
  }

  static async deleteUser({ id }) {
    try {
      const user = User.findOne({ _id: id });
      if (!user) throw new Error("User not found");

      if (user.isAdmin) throw new Error("Cannot delete admin user");

      user.isActive = false;
      user.updatedAt = formatDateToYYYYMMDD(new Date());
      user.save();
    } catch (error) {
      throw new Error("Delete user failed: " + error.message);
    }
  }

  static async validateUserStatus(id) {
    try {
      const user = User.findOne({ _id: id });
      if (!user || !user.isActive) return false;
      return true;
    } catch (error) {
      throw new Error("User validation failed: " + error.message);
    }
  }

  static async getUserById(id) {
    try {
      const user = User.findOne({ _id: id });
      if (!user) throw new Error("User not found");
      return {
        id: user._id,
        username: user.username,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
      };
    } catch (error) {
      throw new Error("Get user by ID failed: " + error.message);
    }
  }
}
