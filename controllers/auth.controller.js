import { CustomError } from '../utils/custom-error.js';

export class AuthController {
  constructor({ emailService, authService }) {
    this.emailService = emailService;
    this.authService = authService;
  }

  register = async (req, res) => {
    try {
      const user = await this.authService.register({ data: req.body, res });
      res.status(201).json(user);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  login = async (req, res) => {
    try {
      const user = await this.authService.login({ data: req.body, res });
      res.status(200).json(user);
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  logout = (_, res) => {
    try {
      this.authService.logout({ res });
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  deleteUser = async (req, res) => {
    try {
      console.log(req);
      await this.authService.deleteUser({ data: req, res });
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  verifyEmail = async (req, res) => {
    try {
      await this.emailService.verifyEmail({
        token: req.params.token,
      });
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      this.#handleError(error, res);
    }
  };

  #handleError = (error, res) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  };
}
