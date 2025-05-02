import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, CustomError, InternalServerError } from '../utils/custom-error.js';
import config from '../config/config.js';

export class AuthService {
  constructor({ authModel, emailService }) {
    this.authModel = authModel;
    this.emailService = emailService;
  }

  async register({ data, res }) {
    try {
      const { username, email, password } = data;
      let user = await this.authModel.getUserByEmail(email);
      if (user) throw new AuthenticationError('User already exists');
      user = await this.authModel.getUserByUsername(data.username);
      if (user) throw new AuthenticationError('User already exists');
      user = await this.authModel.register({
        username,
        email: data.email.toLowerCase(),
        password,
      });
      if (!user) throw new InternalServerError('Error registering user');

      // eslint-disable-next-line no-undef
      setImmediate(async () => {
        await this.emailService.sendVerificationEmail(user);
      });

      this.#setAuthCookie(res, user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error registering user');
    }
  }

  async login({ data, res }) {
    try {
      const { email, password } = data;
      let user = await this.authModel.getUserByEmail(email);
      if (!user) throw new AuthenticationError('Invalid credentials');
      if (!user.isActive) throw new AuthenticationError('User inactive, please contact support');
      user = await this.authModel.login({ email, password });
      this.#setAuthCookie(res, user);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error logging in user');
    }
  }

  async logout({ res }) {
    try {
      res.clearCookie('auth_token');
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error logging out user');
    }
  }

  async deleteUser({ data }) {
    try {
      const user = data.user;
      const { id } = data.params;
      if (!user.isAdmin) throw new AuthorizationError('Unauthorized to delete users');
      await this.authModel.deleteUser({ id });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error deleting user');
    }
  }

  async verifyEmail({ token }) {
    try {
      const decodedToken = jwt.verify(token, config.jwtSecretKey);
      const { email } = decodedToken;
      await this.authModel.verifyEmail({ email });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new InternalServerError('Error registering user');
    }
  }

  #setAuthCookie = (res, user) => {
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, config.jwtSecretKey, { expiresIn: '1h' });

    if (!token) throw new InternalServerError('Error generating token');

    res
      .cookie('auth_token', token, {
        httpOnly: true,
        secure: config.nodeEnvironment === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1 hour
      })
      .status(200)
      .send(user);
  };
}
