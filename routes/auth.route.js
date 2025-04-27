import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

export const createAuthRouter = ({ authModel, emailService, config }) => {
  const authRouter = Router();

  const authController = new AuthController({
    authModel,
    emailService,
    config,
  });

  authRouter.post("/register", authController.register);
  authRouter.post("/login", authController.login);
  authRouter.get("/verify/:token", authController.verifyEmail);
  authRouter.post("/logout", authController.logout);
  authRouter.delete("/delete/:id", authController.deleteUser);

  return authRouter;
};
