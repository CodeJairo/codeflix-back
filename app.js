import express from "express";

import { createAuthRouter } from "./routes/auth.route.js";
import { createMovieRouter } from "./routes/movie.route.js";

import { corsMiddleware } from "./middlewares/cors.js";

import cookieParser from "cookie-parser";

export const createApp = ({ authModel, movieModel, config, emailService }) => {
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
      config,
    })
  );
  app.use("/movie", createMovieRouter({ authModel, movieModel, config }));

  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
};
