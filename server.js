import { createApp } from "./app.js";
import { AuthModel } from "./models/auth.model.js";
import { MovieModel } from "./models/movie.model.js";
import { EmailService } from "./services/email.service.js";
import config from "./config/config.js";

const emailService = new EmailService({
  config,
});

createApp({
  authModel: AuthModel,
  movieModel: MovieModel,
  emailService,
  config,
});
