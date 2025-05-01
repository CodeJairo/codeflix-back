import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { validateLogin, validateUser } from '../schemas/user.schema.js';
import { authenticate } from '../middlewares/auth.js';

export const createAuthRouter = ({ emailService, authService }) => {
  const authRouter = Router();

  const authController = new AuthController({
    emailService,
    authService,
  });

  authRouter.post('/register', validateRequest(validateUser), authController.register);
  authRouter.post('/login', validateRequest(validateLogin), authController.login);
  authRouter.get('/verify/:token', authController.verifyEmail);
  authRouter.post('/logout', authController.logout);
  authRouter.delete('/delete/:id', authenticate(authModel.getUserById), authController.deleteUser);

  return authRouter;
};
