import { createApp } from "./app.js";
import { AuthModel } from "./models/auth.model.js";
import { MovieModel } from "./models/movie.model.js";
import { EmailService } from "./services/email.service.js";
import { AuthService } from "./services/auth.service.js";

const emailService = new EmailService();
const authService = new AuthService({ authModel: AuthModel, emailService });

createApp({
  authModel: AuthModel,
  movieModel: MovieModel,
  emailService,
  authService,
});
