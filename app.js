import express from "express";
import { createAuthRouter } from "./routes/auth.route.js";
import { createMovieRouter } from "./routes/movie.route.js";
import { corsMiddleware } from "./middlewares/cors.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

export const createApp = ({
  authModel,
  movieModel,
  emailService,
  authService,
}) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware());
  app.disable("x-powered-by");

  app.use("/public", express.static("public"));

  app.use(
    "/auth",
    createAuthRouter({
      authModel,
      emailService,
      authService,
    })
  );

  app.use("/movie", createMovieRouter({ authModel, movieModel }));

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
};
